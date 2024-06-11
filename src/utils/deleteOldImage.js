import {v2 as cloudinary} from 'cloudinary';
import { User } from './../models/user.model';

export const deleteFromCloudinary = async (userId) => {
    // Fetch the user first to get the old avatar's publicId
    const user = await User.findById(userId).select("-password");
  
    // Delete the old avatar from Cloudinary
    if(user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error(err);
      }
    }
  }