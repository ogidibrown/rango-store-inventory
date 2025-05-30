// src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} Rango Stock Inventory App. Created by Gideon Anokye (Brown.Dev) All rights reserved.
        </p>
        <div className="mt-2 md:mt-0 flex space-x-4">
          <a href="#" className="hover:text-gray-400 text-sm">
            Privacy
          </a>
          <a href="#" className="hover:text-gray-400 text-sm">
            Terms
          </a>
          <a href="#" className="hover:text-gray-400 text-sm">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
