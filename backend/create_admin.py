"""
Script to create the admin user for Mini-Gram
Run this script once to create the admin account
"""
import os
import shutil
from src import create_app
from src.models.user import User
from src.extentions import db

def create_admin():
    app = create_app()
    
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(role='admin').first()
        
        if admin:
            print(f"Admin already exists: {admin.username} ({admin.email})")
            
            # Option to update profile picture
            update_pic = input("\nDo you want to update admin profile picture? (y/n): ").strip().lower()
            if update_pic == 'y':
                profile_image_path = input("Enter path to profile image (or press Enter to skip): ").strip()
                
                if profile_image_path and os.path.exists(profile_image_path):
                    # Check if file is an image
                    allowed_extensions = ('.png', '.jpg', '.jpeg')
                    if profile_image_path.lower().endswith(allowed_extensions):
                        # Copy file to upload folder
                        filename = f"admin_profile{os.path.splitext(profile_image_path)[1]}"
                        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                        shutil.copy2(profile_image_path, upload_path)
                        
                        # Update admin profile
                        admin.profile_image = filename
                        db.session.commit()
                        print(f"Profile picture updated successfully!")
                    else:
                        print("Error: Only PNG, JPG, or JPEG files are allowed!")
                elif profile_image_path:
                    print("Error: File not found!")
            return
        
        # Get admin credentials
        print("Creating Admin Account")
        print("-" * 40)
        username = input("Enter admin username: ").strip()
        email = input("Enter admin email: ").strip()
        password = input("Enter admin password: ").strip()
        bio = input("Enter admin bio (optional): ").strip() or "System Administrator"
        profile_image_path = input("Enter path to profile image (optional, press Enter to skip): ").strip()
        
        if not username or not email or not password:
            print("Error: Username, email, and password are required!")
            return
        
        # Check if username or email already exists
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            print("Error: Username or email already exists!")
            return
        
        # Create admin user
        admin = User(
            username=username,
            email=email,
            role="admin",
            bio=bio
        )
        admin.set_password(password)
        
        # Handle profile image if provided
        if profile_image_path and os.path.exists(profile_image_path):
            # Check if file is an image
            allowed_extensions = ('.png', '.jpg', '.jpeg')
            if profile_image_path.lower().endswith(allowed_extensions):
                # Copy file to upload folder
                filename = f"admin_profile{os.path.splitext(profile_image_path)[1]}"
                upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                shutil.copy2(profile_image_path, upload_path)
                admin.profile_image = filename
                print(f"Profile picture added: {filename}")
            else:
                print("Warning: Only PNG, JPG, or JPEG files are allowed. Skipping profile picture.")
        elif profile_image_path:
            print("Warning: Image file not found. Skipping profile picture.")
        
        db.session.add(admin)
        db.session.commit()
        
        print("-" * 40)
        print(f"Admin account created successfully!")
        print(f"Username: {username}")
        print(f"Email: {email}")
        print(f"Bio: {bio}")
        if admin.profile_image:
            print(f"Profile Image: {admin.profile_image}")
        print("-" * 40)

if __name__ == "__main__":
    create_admin()
