import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check if products already exist
    const existingProducts = await db.product.count();
    if (existingProducts > 0) {
      return NextResponse.json({ message: 'Database already seeded', seeded: false });
    }

    // Create admin user
    const admin = await db.user.upsert({
      where: { email: 'admin@luxechains.com' },
      update: {},
      create: {
        email: 'admin@luxechains.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin',
      },
    });

    // Create sample user
    const sampleUser = await db.user.upsert({
      where: { email: 'user@test.com' },
      update: {},
      create: {
        email: 'user@test.com',
        password: 'user123',
        name: 'John Doe',
        phone: '+91 98765 43210',
        role: 'user',
      },
    });

    // Create products
    const products = [
      // Zodiac Sign Chains
      { name: "Aries Constellation Chain", slug: "zodiac-aries", category: "zodiac", price: 2499, comparePrice: 3499, featured: true, trending: true, stock: 25, images: '["/products/zodiac-aries.png"]', description: "Celebrate your Aries spirit with this beautifully crafted constellation chain. Features precision-cut stars arranged in the Aries pattern on a delicate gold-plated chain. Perfect for daily wear or special occasions." },
      { name: "Cancer Zodiac Pendant", slug: "zodiac-cancer", category: "zodiac", price: 2199, comparePrice: 2999, featured: true, trending: false, stock: 18, images: '["/products/zodiac-cancer.png"]', description: "Embrace your intuitive Cancer nature with this elegant zodiac pendant. The silver-plated Cancer symbol hangs gracefully from a fine chain, making it a meaningful gift for yourself or a loved one." },
      { name: "Leo Star Sign Chain", slug: "zodiac-leo", category: "zodiac", price: 2799, comparePrice: 3999, featured: false, trending: true, stock: 15, images: '["/products/zodiac-leo.png"]', description: "Bold and radiant like Leo, this rose gold zodiac chain features the majestic lion symbol surrounded by sparkling accents. A statement piece for the confident Leo in your life." },
      { name: "Pisces Dream Chain", slug: "zodiac-pisces", category: "zodiac", price: 1999, comparePrice: 2799, featured: true, trending: true, stock: 30, images: '["/products/zodiac-pisces.png"]', description: "Dive into the dreamy world of Pisces with this ethereal constellation chain. The twin fish motif is delicately rendered in gold on a dainty chain, perfect for the imaginative Pisces soul." },

      // Custom Chains
      { name: "Personalized Name Pendant", slug: "custom-name", category: "custom", price: 2999, comparePrice: 4499, featured: true, trending: true, stock: 20, images: '["/products/custom-name.png"]', description: "Make it uniquely yours with our personalized name pendant. Each piece is custom-crafted in premium gold plating with your name elegantly scripted. A timeless keepsake that tells your story." },
      { name: "Birthstone Gem Necklace", slug: "custom-birthstone", category: "custom", price: 3499, comparePrice: 4999, featured: false, trending: true, stock: 12, images: '["/products/custom-birthstone.png"]', description: "Carry your birthstone close to your heart. This stunning necklace features a genuine gemstone representing your birth month, set in a minimalist pendant on a sterling silver chain." },
      { name: "Engraved Bar Necklace", slug: "custom-engraved", category: "custom", price: 1899, comparePrice: 2499, featured: true, trending: false, stock: 35, images: '["/products/custom-engraved.png"]', description: "A sleek silver bar pendant that can be engraved with your special message, date, or coordinates. The perfect minimalist piece with a deeply personal touch." },
      { name: "Heart Locket Chain", slug: "custom-locket", category: "custom", price: 3299, comparePrice: 4599, featured: false, trending: false, stock: 10, images: '["/products/custom-locket.png"]', description: "Keep your memories close with our exquisite heart-shaped locket. This gold-plated locket opens to hold two precious photos, making it the most sentimental gift you can give." },

      // Stylish Chains
      { name: "Layered Gold Chain Set", slug: "stylish-layered", category: "stylish", price: 4999, comparePrice: 6999, featured: true, trending: true, stock: 8, images: '["/products/stylish-layered.png"]', description: "Effortlessly chic, this triple-layered gold chain set creates a stunning dimensional effect. Three different chain styles at varying lengths give you a curated, magazine-ready look in one piece." },
      { name: "Minimalist Box Chain", slug: "stylish-minimal", category: "stylish", price: 1499, comparePrice: 1999, featured: true, trending: false, stock: 50, images: '["/products/stylish-minimal.png"]', description: "Less is more. This sleek silver box chain is the epitome of understated elegance. Its uniform links create a subtle shine that complements any outfit, from casual to formal." },
      { name: "Chunky Gold Link Chain", slug: "stylish-chunky", category: "stylish", price: 5999, comparePrice: 7999, featured: false, trending: true, stock: 6, images: '["/products/stylish-chunky.png"]', description: "Make a bold statement with our chunky gold link chain. Inspired by 90s hip-hop fashion but refined for modern elegance, this substantial chain is for those who dare to stand out." },
      { name: "Pearl Drop Necklace", slug: "stylish-pearl", category: "stylish", price: 3999, comparePrice: 5499, featured: true, trending: true, stock: 14, images: '["/products/stylish-pearl.png"]', description: "Classic sophistication meets modern design. A luminous freshwater pearl hangs from a delicate gold-filled chain, creating an accessory that transcends trends and occasions." },
    ];

    const createdProducts: Array<{ id: string }> = [];
    for (const product of products) {
      const created = await db.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          category: product.category,
          images: product.images,
          stock: product.stock,
          featured: product.featured,
          trending: product.trending,
        },
      });
      createdProducts.push(created);
    }

    // Create sample reviews
    const reviewData = [
      { productName: "zodiac-aries", userName: "Priya S.", rating: 5, comment: "Absolutely love this chain! The Aries constellation is so detailed and it shines beautifully. Got so many compliments!" },
      { productName: "zodiac-aries", userName: "Rahul M.", rating: 4, comment: "Great quality for the price. The chain is delicate but sturdy. Wish it came in different lengths." },
      { productName: "custom-name", userName: "Ananya K.", rating: 5, comment: "Got this as a gift for my sister and she was overjoyed! The engraving is perfect and the gold plating looks premium." },
      { productName: "custom-name", userName: "Vikram T.", rating: 5, comment: "Ordered one for myself and one for my girlfriend. Both turned out amazing. The custom work is top-notch." },
      { productName: "stylish-layered", userName: "Meera J.", rating: 4, comment: "The layered look is so trendy and saves me the hassle of wearing multiple chains. Slightly heavier than expected." },
      { productName: "stylish-pearl", userName: "Sneha R.", rating: 5, comment: "Elegant and timeless! The pearl has a beautiful luster. Perfect for both everyday wear and special occasions." },
      { productName: "zodiac-leo", userName: "Karan D.", rating: 5, comment: "As a Leo, this is everything I wanted! Bold, beautiful, and makes a statement. The rose gold is stunning." },
      { productName: "stylish-chunky", userName: "Amit P.", rating: 4, comment: "This chain is serious business! Very chunky and masculine. Great for making a fashion statement. Quality is solid." },
      { productName: "custom-birthstone", userName: "Divya N.", rating: 5, comment: "My birthstone is emerald and it looks gorgeous in this setting. The silver chain is very delicate and pretty." },
      { productName: "custom-engraved", userName: "Rohit G.", rating: 4, comment: "Got coordinates of where I proposed engraved. My wife loved it! Simple yet so meaningful." },
      { productName: "zodiac-pisces", userName: "Isha V.", rating: 5, comment: "The fish motif is so cute and well-crafted. Perfect for my water sign personality. Love the gold finish!" },
      { productName: "stylish-minimal", userName: "Neha B.", rating: 5, comment: "Minimalism at its best! Goes with literally everything in my wardrobe. The silver is hypoallergenic too." },
      { productName: "zodiac-cancer", userName: "Sanjay M.", rating: 4, comment: "Bought this for my mom who's a Cancer. She wears it every day. Good quality silver plating." },
      { productName: "custom-locket", userName: "Pooja S.", rating: 5, comment: "Put photos of my kids inside. It's the most precious piece of jewelry I own. The locket mechanism works smoothly." },
    ];

    for (const review of reviewData) {
      const product = createdProducts.find((p) => p.slug === review.productName);
      if (!product) continue;

      await db.review.create({
        data: {
          productId: product.id,
          userId: Math.random() > 0.5 ? sampleUser.id : null,
          userName: review.userName,
          rating: review.rating,
          comment: review.comment,
        },
      });

      // Update product rating and review count
      const reviews = await db.review.findMany({ where: { productId: product.id } });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await db.product.update({
        where: { id: product.id },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
        },
      });
    }

    // Create sample addresses for the sample user
    await db.address.createMany({
      data: [
        {
          userId: sampleUser.id,
          label: 'Home',
          name: 'John Doe',
          phone: '+91 98765 43210',
          line1: '42, Rose Garden Apartments',
          line2: 'MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          isDefault: true,
        },
        {
          userId: sampleUser.id,
          label: 'Office',
          name: 'John Doe',
          phone: '+91 98765 43210',
          line1: '8th Floor, Tech Park',
          line2: 'Whitefield',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560066',
          isDefault: false,
        },
      ],
    });

    // Create coupons
    await db.coupon.createMany({
      data: [
        { code: 'WELCOME10', discount: 10, type: 'percentage', active: true },
        { code: 'ZODIAC20', discount: 20, type: 'percentage', active: true },
        { code: 'FLAT500', discount: 500, type: 'fixed', minOrder: 2000, active: true },
      ],
    });

    // Create banner
    await db.banner.create({
      data: {
        text: '✨ Flat 20% OFF on All Zodiac Chains! Use Code: ZODIAC20',
        active: true,
      },
    });

    return NextResponse.json({
      message: 'Database seeded successfully',
      seeded: true,
      stats: {
        products: createdProducts.length,
        users: 2,
        coupons: 3,
        addresses: 2,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
