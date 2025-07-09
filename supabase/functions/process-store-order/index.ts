import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OrderItem {
  addon_id: string
  addon_name: string
  addon_description: string
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderData {
  customer_name: string
  customer_email: string
  customer_phone?: string
  institution_name: string
  billing_address?: any
  payment_method: string
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const orderData: OrderData = await req.json()

    // Validate required fields
    if (!orderData.customer_name || !orderData.customer_email || !orderData.items || orderData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('store_orders')
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        institution_name: orderData.institution_name,
        billing_address: orderData.billing_address,
        payment_method: orderData.payment_method,
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        discount_amount: orderData.discount_amount,
        total_amount: orderData.total_amount,
        order_status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      addon_id: item.addon_id,
      addon_name: item.addon_name,
      addon_description: item.addon_description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }))

    const { error: itemsError } = await supabase
      .from('store_order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      // Rollback order creation
      await supabase.from('store_orders').delete().eq('id', order.id)
      
      return new Response(
        JSON.stringify({ error: 'Failed to create order items' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update download counts for purchased add-ons
    for (const item of orderData.items) {
      await supabase.rpc('increment_download_count', { addon_id: item.addon_id })
    }

    // Try to send confirmation email if MailerSend API key is available
    const mailersendApiKey = Deno.env.get('MAILERSEND_API_KEY')
    let emailSent = false

    if (mailersendApiKey) {
      try {
        const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation - ${orderNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #697BBC; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
        .order-item { background-color: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #697BBC; }
        .total { background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
            <p style="margin: 0; opacity: 0.9;">Order #${orderNumber}</p>
        </div>
        <div class="content">
            <p>Dear ${orderData.customer_name},</p>
            <p>Thank you for your purchase! Your order has been received and is being processed.</p>
            
            <h3>Order Details:</h3>
            ${orderData.items.map(item => `
              <div class="order-item">
                <h4>${item.addon_name}</h4>
                <p>${item.addon_description}</p>
                <p><strong>Quantity:</strong> ${item.quantity} × KES ${item.unit_price.toLocaleString()} = KES ${item.total_price.toLocaleString()}</p>
              </div>
            `).join('')}
            
            <div class="total">
                <h3>Order Summary</h3>
                <p><strong>Subtotal:</strong> KES ${orderData.subtotal.toLocaleString()}</p>
                ${orderData.tax_amount > 0 ? `<p><strong>Tax:</strong> KES ${orderData.tax_amount.toLocaleString()}</p>` : ''}
                ${orderData.discount_amount > 0 ? `<p><strong>Discount:</strong> -KES ${orderData.discount_amount.toLocaleString()}</p>` : ''}
                <p><strong>Total:</strong> KES ${orderData.total_amount.toLocaleString()}</p>
            </div>
            
            <p>We will process your order and send you download links and license keys within 24 hours.</p>
            <p>If you have any questions, please contact our support team at support@acadeemia.com</p>
            
            <p>Best regards,<br>The Acadeemia Team</p>
        </div>
    </div>
</body>
</html>
        `

        const response = await fetch('https://api.mailersend.com/v1/email', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mailersendApiKey}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            from: {
              email: 'noreply@acadeemia.com',
              name: 'Acadeemia Store'
            },
            to: [
              {
                email: orderData.customer_email,
                name: orderData.customer_name
              }
            ],
            subject: `Order Confirmation - ${orderNumber}`,
            html: emailContent
          })
        })

        if (response.ok) {
          emailSent = true
        }
      } catch (error) {
        console.error('Email sending error:', error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        order_id: order.id,
        order_number: orderNumber,
        message: 'Order created successfully',
        email_sent: emailSent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing order:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})