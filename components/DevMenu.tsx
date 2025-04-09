"use client";
import Link from 'next/link';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

const DevMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const supabase = createClientComponentClient();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const generateInviteCode = async () => {
    try {
      setIsGeneratingCode(true);
      
      // Get current user's profile
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw userError || new Error('No user found');
      }

      // Generate a random code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      console.log('Generated new code:', code);

      // Update the user's profile with the new code
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ invite_code: code })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('New invite code generated successfully!');
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('Failed to generate invite code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button onClick={toggleMenu} className="p-2 bg-gray-800 text-white rounded-full">
        ☰
      </button>
      {isOpen && (
        <div className="absolute bottom-12 right-0 p-4 bg-gray-800 text-white w-64 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Dev Menu</h2>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setIsQuickAddOpen(true)}
                className="w-full text-left hover:text-gray-300"
              >
                Quick Add Item
              </button>
            </li>
            <li><Link href="/collection" className="hover:text-gray-300">Collection</Link></li>
            <li><Link href="/vault" className="hover:text-gray-300">Vault</Link></li>
            <li><Link href="/profile" className="hover:text-gray-300">Profile</Link></li>
            <li><Link href="/register" className="hover:text-gray-300">Register</Link></li>
            <li><Link href="/marketplace" className="hover:text-gray-300">Marketplace</Link></li>
            <li><Link href="/login" className="hover:text-gray-300">Login</Link></li>
            <li><Link href="/forums" className="hover:text-gray-300">Forums</Link></li>
            <li><Link href="/collection/collection-client" className="hover:text-gray-300">Collection Client</Link></li>
            <li>
              <button 
                onClick={generateInviteCode}
                disabled={isGeneratingCode}
                className="w-full text-left hover:text-gray-300 disabled:opacity-50"
              >
                {isGeneratingCode ? 'Generating Code...' : 'Generate New Invite Code'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DevMenu; 