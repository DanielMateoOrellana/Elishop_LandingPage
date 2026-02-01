import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@elishop.ec' },
        update: {},
        create: {
            email: 'admin@elishop.ec',
            password: hashedPassword,
            name: 'Admin Elishop',
            role: 'SUPER_ADMIN',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'anillos' },
            update: {},
            create: {
                name: 'Anillos',
                slug: 'anillos',
                description: 'Anillos para toda ocasión',
                icon: '💍',
                color: '#e91e63',
                sortOrder: 1,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'collares' },
            update: {},
            create: {
                name: 'Collares',
                slug: 'collares',
                description: 'Collares elegantes y modernos',
                icon: '📿',
                color: '#9c27b0',
                sortOrder: 2,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'pulseras' },
            update: {},
            create: {
                name: 'Pulseras',
                slug: 'pulseras',
                description: 'Pulseras para cada estilo',
                icon: '⌚',
                color: '#673ab7',
                sortOrder: 3,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'sets-regalo' },
            update: {},
            create: {
                name: 'Sets de Regalo',
                slug: 'sets-regalo',
                description: 'Sets perfectos para regalar',
                icon: '🎁',
                color: '#ff5722',
                sortOrder: 4,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'aretes' },
            update: {},
            create: {
                name: 'Aretes',
                slug: 'aretes',
                description: 'Aretes únicos y especiales',
                icon: '✨',
                color: '#ffc107',
                sortOrder: 5,
            },
        }),
    ]);
    console.log(`✅ ${categories.length} categories created`);

    // Create sample products
    const setsCategory = categories.find(c => c.slug === 'sets-regalo')!;
    const anillosCategory = categories.find(c => c.slug === 'anillos')!;

    const products = await Promise.all([
        prisma.product.upsert({
            where: { slug: 'set-princesa-rapunzel' },
            update: {},
            create: {
                name: 'Set Princesa Rapunzel',
                slug: 'set-princesa-rapunzel',
                description: 'Corona porta anillo + Collar + Tarjeta personalizada',
                price: 25.99,
                compareAtPrice: 35.00,
                categoryId: setsCategory.id,
                isFeatured: true,
                isNew: true,
                images: {
                    create: [
                        { url: '/images/rapunzel-set.jpg', alt: 'Set Princesa Rapunzel', sortOrder: 0 },
                    ],
                },
                inventory: {
                    create: {
                        stock: 15,
                        minStock: 5,
                    },
                },
            },
        }),
        prisma.product.upsert({
            where: { slug: 'set-san-valentin' },
            update: {},
            create: {
                name: 'Set San Valentín',
                slug: 'set-san-valentin',
                description: 'Collar corazón + Aretes + Caja de regalo',
                price: 32.99,
                compareAtPrice: 45.00,
                categoryId: setsCategory.id,
                isFeatured: true,
                images: {
                    create: [
                        { url: '/images/san-valentin-set.jpg', alt: 'Set San Valentín', sortOrder: 0 },
                    ],
                },
                inventory: {
                    create: {
                        stock: 20,
                        minStock: 5,
                    },
                },
            },
        }),
        prisma.product.upsert({
            where: { slug: 'anillo-mariposa-dorado' },
            update: {},
            create: {
                name: 'Anillo Mariposa Dorado',
                slug: 'anillo-mariposa-dorado',
                description: 'Hermoso anillo con diseño de mariposa en tono dorado',
                price: 8.99,
                categoryId: anillosCategory.id,
                images: {
                    create: [
                        { url: '/images/anillo-mariposa.jpg', alt: 'Anillo Mariposa', sortOrder: 0 },
                    ],
                },
                inventory: {
                    create: {
                        stock: 30,
                        minStock: 10,
                    },
                },
            },
        }),
    ]);
    console.log(`✅ ${products.length} products created`);

    console.log('✅ Seeding completed!');
    console.log(`
📧 Admin login:
   Email: admin@elishop.ec
   Password: admin123
  `);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
