"use client";
import Link from 'next/link';
import { useState } from 'react';

const DevMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button onClick={toggleMenu} className="p-2 bg-gray-800 text-white rounded-full">
        ☰
      </button>
      {isOpen && (
        <div className="absolute bottom-12 right-0 p-4 bg-gray-800 text-white w-64 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Dev Menu</h2>
          <ul>
            <li><Link href="/collection">Collection</Link></li>
            <li><Link href="/vault">Vault</Link></li>
            <li><Link href="/profile">Profile</Link></li>
            <li><Link href="/register">Register</Link></li>
            <li><Link href="/marketplace">Marketplace</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/forums">Forums</Link></li>
            <li><Link href="/collection/collection-client">Collection Client</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DevMenu; 