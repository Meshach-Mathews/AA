import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Plus, Minus, X, Check, Cloud, Server, 
  CreditCard, Package, Shield, Star, Filter, Search
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'saas' | 'standalone';
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

interface CartItem extends AddOn {
  quantity: number;
}

const Store: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<'all' | 'saas' | 'standalone'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const addOns: AddOn[] = [
    // SaaS Add-ons
    {
      id: 'saas-qr-attendance',
      name: 'QR Code Attendance',
      description: 'Advanced attendance tracking using QR codes for quick and accurate recording. Students and staff can check in/out by scanning QR codes.',
      price: 3999,
      category: 'saas',
      features: [
        'QR code generation for each user',
        'Mobile app scanning capability',
        'Real-time attendance updates',
        'Attendance reports and analytics',
        'Integration with existing attendance system'
      ],
      popular: true,
      icon: <Package size={24} />
    },
    {
      id: 'saas-2fa',
      name: 'Two-Factor Authentication',
      description: 'Enhanced security with two-factor authentication for user accounts. Protect sensitive data with an extra layer of security.',
      price: 2999,
      category: 'saas',
      features: [
        'SMS-based verification',
        'App-based authentication (Google Authenticator)',
        'Backup codes for account recovery',
        'Admin controls for 2FA enforcement',
        'Security audit logs'
      ],
      popular: true,
      icon: <Shield size={24} />
    },
    // Standalone Add-ons
    {
      id: 'standalone-android-app',
      name: 'Android App',
      description: 'Mobile access through dedicated Android application. Native mobile experience for students, teachers, and parents.',
      price: 3999,
      category: 'standalone',
      features: [
        'Native Android application',
        'Offline data synchronization',
        'Push notifications',
        'Mobile-optimized interface',
        'App store deployment assistance'
      ],
      popular: true,
      icon: <Package size={24} />
    },
    {
      id: 'standalone-behavior-records',
      name: 'Behaviour Records',
      description: 'Track and manage student behavior and disciplinary records. Comprehensive behavior management system.',
      price: 1999,
      category: 'standalone',
      features: [
        'Incident reporting system',
        'Behavior tracking and analytics',
        'Parent notification system',
        'Disciplinary action workflows',
        'Behavior improvement plans'
      ],
      icon: <Package size={24} />
    },
    {
      id: 'standalone-biometrics',
      name: 'Biometrics Entry',
      description: 'Biometric authentication for secure access control. Fingerprint and facial recognition support.',
      price: 1999,
      category: 'standalone',
      features: [
        'Fingerprint recognition',
        'Facial recognition (optional)',
        'Access control integration',
        'Attendance via biometrics',
        'Security audit trails'
      ],
      icon: <Shield size={24} />
    },
    {
      id: 'standalone-cbse-exam',
      name: 'CBSE Examination',
      description: 'Specialized module for CBSE examination management. Compliant with CBSE guidelines and requirements.',
      price: 1999,
      category: 'standalone',
      features: [
        'CBSE-compliant exam formats',
        'Grade calculation as per CBSE',
        'Report card generation',
        'Continuous assessment tracking',
        'Board exam preparation tools'
      ],
      popular: true,
      icon: <Package size={24} />
    },
    {
      id: 'standalone-gmeet',
      name: 'Google Meet Live Classes',
      description: 'Google Meet integration for virtual learning. Seamless video conferencing for online classes.',
      price: 1499,
      category: 'standalone',
      features: [
        'Google Meet integration',
        'Automated meeting creation',
        'Class scheduling with Meet links',
        'Recording capabilities',
        'Attendance tracking for online classes'
      ],
      popular: true,
      icon: <Package size={24} />
    },
    {
      id: 'standalone-multi-branch',
      name: 'Multi Branch',
      description: 'Manage multiple branches or campuses from a single system. Centralized management with branch-specific controls.',
      price: 2999,
      category: 'standalone',
      features: [
        'Multiple campus management',
        'Branch-specific user roles',
        'Centralized reporting',
        'Inter-branch data sharing',
        'Branch performance analytics'
      ],
      popular: true,
      icon: <Package size={24} />
    },
    {
      id: 'standalone-online-course',
      name: 'Online Course',
      description: 'Complete online course management system. Create, manage, and deliver online courses effectively.',
      price: 2499,
      category: 'standalone',
      features: [
        'Course creation tools',
        'Video content management',
        'Student progress tracking',
        'Assignment and quiz system',
        'Certificate generation'
      ],
      icon: <Package size={24} />
    },
    {
      id: 'standalone-qr-attendance',
      name: 'QR Code Attendance',
      description: 'Quick and accurate attendance tracking using QR codes. Mobile-friendly attendance solution.',
      price: 1999,
      category: 'standalone',
      features: [
        'QR code generation',
        'Mobile scanning app',
        'Real-time attendance updates',
        'Attendance analytics',
        'Parent notifications'
      ],
      popular: true,
      icon: <Package size={24} />
    },
    {
      id: 'standalone-quick-fees',
      name: 'Quick Fees',
      description: 'Streamlined fee collection and management system. Simplified fee processing with multiple payment options.',
      price: 1999,
      category: 'standalone',
      features: [
        'Quick fee collection interface',
        'Multiple payment gateways',
        'Fee reminder system',
        'Receipt generation',
        'Fee analytics and reporting'
      ],
      icon: <Package size={24} />
    },
    {
      id: 'standalone-thermal-print',
      name: 'Thermal Print',
      description: 'Support for thermal printing of receipts and documents. Efficient printing solution for schools.',
      price: 1999,
      category: 'standalone',
      features: [
        'Thermal printer integration',
        'Receipt printing',
        'ID card printing',
        'Report printing optimization',
        'Print queue management'
      ],
      icon: <Package size={24} />
    },
    {
      id: 'standalone-2fa',
      name: 'Two-Factor Authenticator',
      description: 'Enhanced security with two-factor authentication. Protect your school data with advanced security.',
      price: 1999,
      category: 'standalone',
      features: [
        'SMS verification',
        'App-based authentication',
        'Backup codes',
        'Admin security controls',
        'Security audit logs'
      ],
      popular: true,
      icon: <Shield size={24} />
    },
    {
      id: 'standalone-zoom',
      name: 'Zoom Live Classes',
      description: 'Integrate Zoom for seamless virtual classroom experiences. Professional video conferencing for education.',
      price: 1999,
      category: 'standalone',
      features: [
        'Zoom integration',
        'Automated meeting scheduling',
        'Recording capabilities',
        'Breakout room support',
        'Attendance tracking'
      ],
      popular: true,
      icon: <Package size={24} />
    }
  ];

  // Filter add-ons based on category and search
  const filteredAddOns = addOns.filter(addon => {
    const matchesCategory = activeCategory === 'all' || addon.category === activeCategory;
    const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addon.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart functions
  const addToCart = (addon: AddOn) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === addon.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === addon.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...addon, quantity: 1 }];
    });
  };

  const removeFromCart = (addonId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== addonId));
  };

  const updateQuantity = (addonId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(addonId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === addonId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Handle URL hash for category filtering
  useEffect(() => {
    if (location.hash === '#saas') {
      setActiveCategory('saas');
    } else if (location.hash === '#standalone') {
      setActiveCategory('standalone');
    }
  }, [location.hash]);

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  // Fetch add-ons from database
  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const { data, error } = await supabase
          .from('store_addons')
          .select(`
            *,
            category:store_categories(name, slug)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform database data to match existing interface
        const transformedAddons = data?.map(addon => ({
          id: addon.id,
          name: addon.name,
          description: addon.description,
          price: addon.price,
          features: addon.features || [],
          popular: addon.is_popular,
          icon: <Package size={24} />,
          category: addon.category?.slug === 'saas-addons' ? 'saas' : 'standalone'
        })) || [];

        // Update the existing addOns array with database data
        setFilteredAddOns(transformedAddons);
      } catch (error) {
        console.error('Error fetching add-ons:', error);
      }
    };

    fetchAddons();
  }, []);

  return (
    <div className="pt-20 animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Acadeemia Store
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Enhance your school management system with powerful add-ons and extensions.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="bg-white py-8 border-b border-gray-200 sticky top-20 z-40">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search add-ons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Add-ons
              </button>
              <button
                onClick={() => setActiveCategory('saas')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === 'saas'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Cloud size={16} className="mr-2" />
                SaaS Add-ons
              </button>
              <button
                onClick={() => setActiveCategory('standalone')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === 'standalone'
                    ? 'bg-secondary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Server size={16} className="mr-2" />
                Standalone Add-ons
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              <ShoppingCart size={20} className="mr-2" />
              Cart
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Add-ons Grid */}
      <section className="section">
        <div className="container">
          {filteredAddOns.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No add-ons found</h3>
              <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAddOns.map((addon) => (
                <Card key={addon.id} className="h-full relative" bordered hoverEffect>
                  {addon.popular && (
                    <div className="absolute -top-3 left-4 bg-accent-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star size={14} className="mr-1" />
                      Popular
                    </div>
                  )}
                  
                  <div className="flex flex-col h-full">
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`p-2 rounded-lg w-10 h-10 flex items-center justify-center ${
                        addon.category === 'saas' ? 'bg-primary-50 text-primary-600' : 'bg-secondary-50 text-secondary-600'
                      }`}>
                        {addon.icon}
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        addon.category === 'saas' 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'bg-secondary-50 text-secondary-700'
                      }`}>
                        {addon.category === 'saas' ? 'SaaS' : 'Standalone'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{addon.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-grow">{addon.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {addon.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start text-xs text-gray-600">
                            <Check size={12} className="text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {addon.features.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{addon.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold text-lg">KES {addon.price.toLocaleString()}</span>
                      <Button 
                        variant={addon.category === 'saas' ? 'primary' : 'secondary'} 
                        size="sm" 
                        onClick={() => addToCart(addon)}
                        icon={<Plus size={16} />}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-medium">
                            KES {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold">KES {getTotalPrice().toLocaleString()}</span>
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleCheckout}
                    icon={<CreditCard size={18} />}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={getTotalPrice()}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setCart([]);
            setShowCheckout(false);
            setShowCart(false);
          }}
        />
      )}
    </div>
  );
};

// Checkout Modal Component
interface CheckoutModalProps {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ cart, total, onClose, onSuccess }) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    institution: '',
    billingAddress: '',
    city: '',
    country: 'Kenya',
    paymentMethod: 'mpesa'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = () => {
    // Simulate payment processing
    processOrder();
  };

  const processOrder = async () => {
    try {
      const orderData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        institution_name: formData.institution,
        billing_address: {
          address: formData.billingAddress,
          city: formData.city,
          country: formData.country
        },
        payment_method: formData.paymentMethod,
        items: cart.map(item => ({
          addon_id: item.id,
          addon_name: item.name,
          addon_description: item.description,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        })),
        subtotal: total,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: total
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-store-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process order');
      }

      setStep('success');
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    }
  };

  const handleSuccess = () => {
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {step === 'details' && 'Billing Details'}
              {step === 'payment' && 'Payment'}
              {step === 'success' && 'Order Complete'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {step === 'details' && (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution *
                  </label>
                  <input
                    type="text"
                    name="institution"
                    required
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Address
                </label>
                <input
                  type="text"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>KES {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button type="submit" variant="primary" fullWidth>
                Continue to Payment
              </Button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Select Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={formData.paymentMethod === 'mpesa'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <span>M-Pesa</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <span>Bank Transfer</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                  Back
                </Button>
                <Button variant="primary" onClick={handlePayment} className="flex-1">
                  Pay Now
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Order Successful!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. You will receive an email confirmation shortly.
              </p>
              <Button variant="primary" onClick={handleSuccess}>
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Store;