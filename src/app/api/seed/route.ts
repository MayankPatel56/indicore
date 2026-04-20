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
      where: { email: 'admin@indicore.com' },
      update: {},
      create: {
        email: 'admin@indicore.com',
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

    // Create products — IndiCore Originals product catalog
    const products = [
      {
        name: "Mini Portable Rechargeable Handheld Desk Fan",
        slug: "portable-desk-fan",
        category: "portable-fans",
        price: 599,
        comparePrice: 1299,
        featured: true,
        trending: true,
        stock: 50,
        images: '["/products/portable-desk-fan.png"]',
        description: "Stay cool anywhere with this ultra-portable rechargeable desk fan. Featuring a cute compact design with a sturdy base, this mini fan is perfect for your office desk, bedside table, or travel. The USB rechargeable battery provides hours of cooling comfort, while the whisper-quiet motor ensures zero distraction. Ideal for kids, adults, and anyone who needs a personal breeze on the go."
      },
      {
        name: "Premium Sweat Belt Waist Trainer",
        slug: "sweat-belt-waist-trainer",
        category: "fitness",
        price: 499,
        comparePrice: 999,
        featured: true,
        trending: true,
        stock: 80,
        images: '["/products/sweat-belt.png"]',
        description: "Accelerate your fitness goals with our premium non-tearable sweat belt. Designed for both men and women, this sauna belt waist trainer increases thermal activity around your core, helping you sweat more during workouts. Made from ultra-durable, flexible neoprene that contours to your body without restricting movement. Fully adjustable for all body types — wear it during exercise, daily chores, or even at work."
      },
      {
        name: "Portable Mini 2-in-1 Bag Sealer with Cutter",
        slug: "portable-bag-sealer",
        category: "home-essentials",
        price: 399,
        comparePrice: 799,
        featured: true,
        trending: false,
        stock: 60,
        images: '["/products/bag-sealer.png"]',
        description: "Keep your snacks and food fresh with this sleek portable bag sealer. The 2-in-1 design combines a powerful heat sealer with a built-in cutter — seal any plastic bag in seconds and cut it open just as easily. USB rechargeable with a long-lasting battery, it's the perfect kitchen companion for meal prep, snack storage, and food preservation. Compact enough to carry anywhere, making it ideal for travel, camping, and picnics."
      },
      {
        name: "EVERAIRY Rechargeable Bladeless Neck Fan",
        slug: "neck-fan-bladeless",
        category: "portable-fans",
        price: 899,
        comparePrice: 1599,
        featured: true,
        trending: true,
        stock: 40,
        images: '["/products/neck-fan.png"]',
        description: "Experience hands-free cooling like never before with the EVERAIRY bladeless neck fan. Featuring a powerful 1200mAh rechargeable battery that delivers up to 7 hours of continuous cooling on a single charge. The innovative bladeless design provides 3 speed settings with ultra-low noise operation. Lightweight and ergonomic, it sits comfortably around your neck — perfect for outdoor activities, commuting, sports, or simply beating the summer heat in style."
      },
    ];

    const createdProducts: Array<{ id: string; slug: string }> = [];
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
      { productName: "portable-desk-fan", userName: "Priya S.", rating: 5, comment: "This little fan is a lifesaver! Super cute design, charges fast, and the battery lasts all day. I use it at my office desk and everyone wants one now!" },
      { productName: "portable-desk-fan", userName: "Rahul M.", rating: 4, comment: "Great portable fan for the price. The base is really stable and the airflow is surprisingly strong. Perfect for my bedside table." },
      { productName: "sweat-belt-waist-trainer", userName: "Ananya K.", rating: 5, comment: "I've been using this during my workouts for 2 weeks and the results are amazing! It really makes you sweat more around the core area. Great quality material." },
      { productName: "sweat-belt-waist-trainer", userName: "Vikram T.", rating: 4, comment: "Good quality waist trainer. Stays in place during running and doesn't roll up like others I've tried. Definitely worth the price." },
      { productName: "portable-bag-sealer", userName: "Meera J.", rating: 5, comment: "Such a handy kitchen gadget! Seals chip bags perfectly and the cutter is super sharp. USB charging is very convenient. A must-have for every kitchen." },
      { productName: "portable-bag-sealer", userName: "Sneha R.", rating: 5, comment: "I love this little device! My snacks stay fresh for so much longer now. It's small enough to keep in a drawer and the battery lasts forever." },
      { productName: "neck-fan-bladeless", userName: "Karan D.", rating: 5, comment: "Game changer for summer! The bladeless design is genius — no hair getting caught. Wore it during a cricket match and got 6+ hours of cooling." },
      { productName: "neck-fan-bladeless", userName: "Amit P.", rating: 4, comment: "Really comfortable to wear and the 3 speed settings are great. Only wish it was a bit lighter, but overall it's the best neck fan I've owned." },
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
        { code: 'CORE20', discount: 20, type: 'percentage', active: true },
        { code: 'FLAT200', discount: 200, type: 'fixed', minOrder: 999, active: true },
      ],
    });

    // Create banner
    await db.banner.create({
      data: {
        text: '✨ Welcome to IndiCore Originals — Premium Products, Rooted in Heritage. Use Code: WELCOME10 for 10% OFF!',
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
