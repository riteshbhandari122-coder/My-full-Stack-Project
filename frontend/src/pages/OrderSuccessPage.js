import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch {}
    };
    fetchOrder();
  }, [id]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={48} className="text-green-500" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-2">Thank you for shopping with ShopMart!</p>
        {order && <p className="text-primary-600 font-semibold">Order #{order.orderNumber}</p>}

        {order && (
          <div className="bg-white rounded-xl p-6 shadow-card mt-6 text-left">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FiPackage size={16} /> Order Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span>{order.items.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="capitalize">{order.paymentMethod}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">📦 Estimated delivery: 3-5 business days</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <Link to={`/orders/${id}`} className="btn-primary flex items-center justify-center gap-2">
            Track Order <FiArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn-outline">Continue Shopping</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
