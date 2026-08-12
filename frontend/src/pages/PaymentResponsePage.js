import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader, FiPackage, FiArrowRight } from 'react-icons/fi';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';

const PaymentResponsePage = () => {
  const navigate = useNavigate();
  const { clearCart, fetchCart } = useCartStore();
  const [status, setStatus] = useState('verifying');
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const method = path.includes('esewa') ? 'esewa' : 'khalti';

    const verify = async () => {
      try {
        if (method === 'esewa') {
          const oid = params.get('oid') || params.get('transaction_uuid')?.split('-')[0];
          const paymentId = params.get('paymentId');
          const esewaStatus = params.get('status');

          if (esewaStatus === 'failure') {
            setStatus('failed');
            toast.error('eSewa payment was cancelled or failed');
            return;
          }

          const { data } = await api.post('/payment/esewa/verify', { oid, paymentId });

          setOrder(data.order);
          setPayment(data.payment);
          setStatus('success');

          // ✅ Automatically clear frontend cart store upon verification
          if (clearCart) clearCart();
          if (fetchCart) fetchCart();

          toast.success('Payment verified successfully!');
        } else {
          const pidx = params.get('pidx');
          const transactionId = params.get('transaction_id');
          const orderId = params.get('purchase_order_id') || params.get('order_id');
          const paymentId = params.get('paymentId');
          const khaltiStatus = params.get('status');

          if (khaltiStatus === 'Failed' || !pidx) {
            setStatus('failed');
            toast.error('Khalti payment was cancelled or failed');
            return;
          }

          const { data } = await api.post('/payment/khalti/verify', { pidx, orderId, paymentId, transactionId });

          setOrder(data.order);
          setPayment(data.payment);
          setStatus('success');

          // ✅ Automatically clear frontend cart store upon verification
          if (clearCart) clearCart();
          if (fetchCart) fetchCart();

          toast.success('Payment verified successfully!');
        }
      } catch (err) {
        console.error('Payment verification failed:', err);
        setStatus('failed');
        toast.error(err.message || 'Payment verification failed');
      }
    };

    verify();
  }, [navigate, clearCart, fetchCart]);

  if (status === 'verifying') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLoader size={48} className="text-blue-500 animate-spin" />
          </div>
        </motion.div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Verifying Payment...</h1>
        <p className="text-gray-500">Please wait while we confirm your transaction.</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiXCircle size={48} className="text-red-500" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-6">
            Your payment could not be completed. Your order is still placed and you can retry payment from the order page.
          </p>

          <div className="flex flex-col gap-3 mt-6">
            <Link to="/orders" className="btn-primary flex items-center justify-center gap-2">
              View My Orders <FiArrowRight size={16} />
            </Link>
            <Link to="/products" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={48} className="text-emerald-500" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful! 🎉</h1>
        <p className="text-gray-500 mb-2">Thank you for your eco-friendly purchase!</p>
        {order && <p className="text-emerald-600 font-semibold">Order #{order.orderNumber}</p>}

        {order && (
          <div className="bg-white rounded-xl p-6 shadow-card mt-6 text-left">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FiPackage size={16} /> Order Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span>{order.items.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="capitalize">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><span className="font-mono text-xs">{payment?.transactionId || order.paymentResult?.id}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
            </div>
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">✅ Payment status: Paid</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <Link to={order ? `/orders/${order._id}` : '/orders'} className="btn-primary flex items-center justify-center gap-2">
            Track Order <FiArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn-outline">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentResponsePage;