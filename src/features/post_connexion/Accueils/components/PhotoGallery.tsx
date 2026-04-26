// src/features/post_connexion/Accueils/components/PhotoGallery.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { User } from '../types';
import { motion } from 'framer-motion';

interface PhotoGalleryProps {
  user: User;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ user }) => {
  const photos = user.photos || [];

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Photos ({photos.length})</h3>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Image
                src={photo}
                alt={`Photo ${index + 1} for ${user.name}`}
                layout="fill"
                className="object-cover cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Aucune photo à afficher.</p>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
