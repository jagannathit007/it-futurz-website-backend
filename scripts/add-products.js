const mongoose = require('mongoose');
const Product = require('../models/product.model');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/it-futurz');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample products data matching the home page
const sampleProducts = [
  {
    title: 'Website Builder Pro',
    description: 'Create stunning, professional websites with our drag-and-drop builder. No coding required.',
    benefits: [
      'Drag & Drop Builder',
      'Mobile Responsive',
      'SEO Optimized',
      '24/7 Support'
    ],
    isActive: true
  },
  {
    title: 'CRM System',
    description: 'Complete customer relationship management solution to streamline your sales process.',
    benefits: [
      'Lead Management',
      'Sales Pipeline',
      'Customer Tracking',
      'Analytics Dashboard'
    ],
    isActive: true
  },
  {
    title: 'ERP Software',
    description: 'Enterprise resource planning solution for comprehensive business management.',
    benefits: [
      'Inventory Management',
      'Financial Tracking',
      'HR Management',
      'Multi-location Support'
    ],
    isActive: true
  },
  {
    title: 'Attendance & Payroll',
    description: 'Automated attendance tracking and payroll management system.',
    benefits: [
      'Biometric Integration',
      'Auto Payroll Calculation',
      'Leave Management',
      'Reports & Analytics'
    ],
    isActive: true
  },
  {
    title: 'WhatsApp Business Suite',
    description: 'Complete WhatsApp automation and marketing solution for businesses.',
    benefits: [
      'Bulk Messaging',
      'Auto Responses',
      'Chatbot Integration',
      'Analytics Dashboard'
    ],
    isActive: true
  },
  {
    title: 'Event Management App',
    description: 'Comprehensive event planning and management solution.',
    benefits: [
      'Event Registration',
      'Ticket Management',
      'Payment Processing',
      'Event Analytics'
    ],
    isActive: true
  },
  {
    title: 'Digital NFC Cards',
    description: 'Modern digital business cards with NFC technology.',
    benefits: [
      'NFC Technology',
      'Contact Sharing',
      'Social Media Links',
      'Analytics Tracking'
    ],
    isActive: true
  },
  {
    title: 'Community Platform',
    description: 'Build and manage online communities with advanced features.',
    benefits: [
      'User Management',
      'Content Moderation',
      'Discussion Forums',
      'Mobile App Support'
    ],
    isActive: true
  }
];

// Add products function
const addProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully created ${createdProducts.length} products:`);
    
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
    });

    console.log('\n✅ Products added successfully!');
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the function
const runAdd = async () => {
  await connectDB();
  await addProducts();
};

// Execute if run directly
if (require.main === module) {
  runAdd();
}

module.exports = { addProducts, sampleProducts };
