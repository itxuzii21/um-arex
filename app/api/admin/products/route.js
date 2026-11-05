import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      category,
      collection_tag,
      price,
      image_urls,
      image_url,
      description,
      specs,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product name is required.',
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product category is required.',
        },
        { status: 400 }
      );
    }

    const productData = {
      name: name.trim(),
      category,
      collection_tag: collection_tag?.trim() || '',
      price: Number(price) || 0,
      image_urls: Array.isArray(image_urls)
        ? image_urls
        : [],
      image_url: image_url || '',
      description: description?.trim() || '',
      specs: Array.isArray(specs)
        ? specs
        : [],
    };

    const { data, error } = await supabaseServer
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Supabase INSERT error:', error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error) {
    console.error('Admin product API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error.',
      },
      { status: 500 }
    );
  }
}