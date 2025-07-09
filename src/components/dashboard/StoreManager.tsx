import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Eye, Search, Filter, 
  DollarSign, ShoppingCart, BarChart, Users, Star,
  CheckCircle, XCircle, Clock, TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface StoreAddon {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  original_price?: number;
  currency: string;
  features: string[];
  is_published: boolean;
  is_featured: boolean;
  is_popular: boolean;
  download_count: number;
  rating: number;
  review_count: number;
  category: {
    name: string;
    slug: string;
  };
  created_at: string;
}

interface StoreOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  institution_name: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  items: {
    addon_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

interface StoreStats {
  totalAddons: number;
  publishedAddons: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

const StoreManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'addons' | 'orders' | 'analytics'>('overview');
  const [addons, setAddons] = useState<StoreAddon[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [stats, setStats] = useState<StoreStats>({
    totalAddons: 0,
    publishedAddons: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<StoreAddon | null>(null);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      // Fetch add-ons with categories
      const { data: addonsData, error: addonsError } = await supabase
        .from('store_addons')
        .select(`
          *,
          category:store_categories(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (addonsError) throw addonsError;

      // Fetch orders with items
      const { data: ordersData, error: ordersError } = await supabase
        .from('store_orders')
        .select(`
          *,
          items:store_order_items(
            addon_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setAddons(addonsData || []);
      setOrders(ordersData || []);

      // Calculate stats
      const totalAddons = addonsData?.length || 0;
      const publishedAddons = addonsData?.filter(addon => addon.is_published).length || 0;
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const pendingOrders = ordersData?.filter(order => order.order_status === 'pending').length || 0;

      setStats({
        totalAddons,
        publishedAddons,
        totalOrders,
        totalRevenue,
        pendingOrders
      });

    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this add-on?')) return;

    try {
      const { error } = await supabase
        .from('store_addons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAddons(addons.filter(addon => addon.id !== id));
    } catch (error) {
      console.error('Error deleting add-on:', error);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('store_addons')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setAddons(addons.map(addon => 
        addon.id === id ? { ...addon, is_published: !currentStatus } : addon
      ));
    } catch (error) {
      console.error('Error updating add-on status:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('store_orders')
        .update({ order_status: status })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, order_status: status } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && addon.is_published) ||
                         (filterStatus === 'draft' && !addon.is_published);
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Manager</h1>
          <p className="text-gray-600">Manage add-ons, orders, and store analytics</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
          onClick={() => setShowAddonModal(true)}
        >
          Add New Add-on
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart size={20} /> },
            { id: 'addons', label: 'Add-ons', icon: <Package size={20} /> },
            { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
            { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-lg mr-4">
                  <Package size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Add-ons</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAddons}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 rounded-lg mr-4">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.publishedAddons}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-50 rounded-lg mr-4">
                  <ShoppingCart size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-50 rounded-lg mr-4">
                  <DollarSign size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">KES {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-50 rounded-lg mr-4">
                  <Clock size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Order #</th>
                    <th className="text-left py-2">Customer</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{order.order_number}</td>
                      <td className="py-3">{order.customer_name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="py-3">KES {order.total_amount.toLocaleString()}</td>
                      <td className="py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Add-ons Tab */}
      {activeTab === 'addons' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search add-ons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Add-ons</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </Card>

          {/* Add-ons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAddons.map(addon => (
              <Card key={addon.id} className="p-6" hoverEffect>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Package size={20} className="text-primary-600 mr-2" />
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {addon.category?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {addon.is_popular && (
                      <Star size={16} className="text-yellow-500" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      addon.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {addon.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">{addon.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{addon.short_description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold">KES {addon.price.toLocaleString()}</span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users size={16} className="mr-1" />
                    {addon.download_count}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit size={16} />}
                    onClick={() => {
                      setEditingAddon(addon);
                      setShowAddonModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={addon.is_published ? "outline" : "primary"}
                    size="sm"
                    icon={addon.is_published ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    onClick={() => handleTogglePublish(addon.id, addon.is_published)}
                  >
                    {addon.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDeleteAddon(addon.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                          <div className="text-sm text-gray-500">{order.institution_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.map((item, index) => (
                            <div key={index}>
                              {item.addon_name} × {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.order_status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.order_status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {order.total_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="outline" size="sm" icon={<Eye size={14} />}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Selling Add-ons</h3>
              <div className="space-y-3">
                {addons
                  .sort((a, b) => b.download_count - a.download_count)
                  .slice(0, 5)
                  .map((addon, index) => (
                    <div key={addon.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="text-gray-500">{addon.download_count} downloads</span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
              <div className="space-y-3">
                {/* This would typically show actual revenue data */}
                <div className="flex items-center justify-between">
                  <span>SaaS Add-ons</span>
                  <span className="font-medium">KES 45,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Standalone Add-ons</span>
                  <span className="font-medium">KES 32,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Premium Features</span>
                  <span className="font-medium">KES 18,000</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Add-on Modal */}
      {showAddonModal && (
        <AddonModal
          addon={editingAddon}
          onClose={() => {
            setShowAddonModal(false);
            setEditingAddon(null);
          }}
          onSave={() => {
            fetchStoreData();
            setShowAddonModal(false);
            setEditingAddon(null);
          }}
        />
      )}
    </div>
  );
};

// Add-on Modal Component
interface AddonModalProps {
  addon: StoreAddon | null;
  onClose: () => void;
  onSave: () => void;
}

const AddonModal: React.FC<AddonModalProps> = ({ addon, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: addon?.name || '',
    slug: addon?.slug || '',
    description: addon?.description || '',
    short_description: addon?.short_description || '',
    price: addon?.price || 0,
    features: addon?.features || [],
    is_published: addon?.is_published || false,
    is_featured: addon?.is_featured || false,
    is_popular: addon?.is_popular || false,
  });

  const [newFeature, setNewFeature] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (addon) {
        // Update existing addon
        const { error } = await supabase
          .from('store_addons')
          .update(formData)
          .eq('id', addon.id);
        
        if (error) throw error;
      } else {
        // Create new addon
        const { error } = await supabase
          .from('store_addons')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving addon:', error);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {addon ? 'Edit Add-on' : 'Create New Add-on'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description *
              </label>
              <input
                type="text"
                required
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (KES) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[index] = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add new feature"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="mr-2"
                />
                Published
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="mr-2"
                />
                Featured
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="mr-2"
                />
                Popular
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                {addon ? 'Update Add-on' : 'Create Add-on'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreManager;