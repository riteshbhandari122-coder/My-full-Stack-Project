import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-8 pb-16 md:pb-0">
      {/* Newsletter */}
      <div className="bg-primary-600 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white text-2xl font-bold">Subscribe to our newsletter</h3>
            <p className="text-primary-200 mt-1">Get exclusive deals, offers and product updates!</p>
          </div>
          <form className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email..."
              className="flex-1 md:w-72 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1 mb-4">
              <span className="text-3xl font-black text-yellow-400">Shop</span>
              <span className="text-3xl font-black text-white">Mart</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your one-stop online shopping destination. Shop electronics, fashion, home & more at unbeatable prices. Fast delivery across Nepal.
            </p>
            <div className="flex gap-3">
              {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Blog', to: '/blog' },
                { label: 'Careers', to: '/careers' },
                { label: 'Press', to: '/press' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {[
                { label: 'FAQ', to: '/faq' },
                { label: 'Return Policy', to: '/returns' },
                { label: 'Shipping Info', to: '/shipping' },
                { label: 'Track Order', to: '/orders' },
                { label: 'Privacy Policy', to: '/privacy' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <FiMapPin size={16} className="mt-0.5 flex-shrink-0 text-yellow-400" />
                <span>Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <FiPhone size={16} className="flex-shrink-0 text-yellow-400" />
                <span>+977-9800000000</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <FiMail size={16} className="flex-shrink-0 text-yellow-400" />
                <span>support@shopmart.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Payment Methods</p>
              <div className="flex gap-2 flex-wrap">
                {['Visa', 'MasterCard', 'Khalti', 'eSewa', 'COD'].map((method) => (
                  <span key={method} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-sm">© 2024 ShopMart. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Made with ❤️ in Nepal 🇳🇵</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
