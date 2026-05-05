import { Link } from "react-router-dom";
import { FaGithub, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      
      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            FixNearby
          </h2>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed">
            Connecting you with trusted local service providers quickly and easily.
            Built for communities, powered by open source.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-blue-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-blue-400 transition">
                Services
              </Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-blue-400 transition">
                Bookings
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-blue-400 transition">
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/help" className="hover:text-blue-400 transition">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-blue-400 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-blue-400 transition">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} FixNearby. All rights reserved.
        </p>

        <div className="flex items-center space-x-5 mt-3 md:mt-0">
          
          {/* GitHub */}
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-400 transition"
          >
            <FaGithub />
            GitHub
          </a>

          {/* Contribute */}
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition"
          >
            Contribute
          </a>

          {/* Contact */}
          <Link
            to="/contact"
            className="flex items-center gap-1 hover:text-blue-400 transition"
          >
            <FaEnvelope />
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;