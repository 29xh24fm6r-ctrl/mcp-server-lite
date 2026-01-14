import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function supabaseQuery(args: any) {
  try {
    const { table, select = '*', filters = {}, limit } = args;
    
    let query = supabase.from(table).select(select);
    
    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`Supabase query error: ${error.message}`);
  }
}

export async function supabaseInsert(args: any) {
  try {
    const { table, data } = args;
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }
}

export async function supabaseUpdate(args: any) {
  try {
    const { table, filters, data } = args;
    
    let query = supabase.from(table).update(data);
    
    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    
    const { data: result, error } = await query.select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`Supabase update error: ${error.message}`);
  }
}

export async function supabaseDelete(args: any) {
  try {
    const { table, filters } = args;
    
    let query = supabase.from(table).delete();
    
    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    
    const { data: result, error } = await query.select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`Supabase delete error: ${error.message}`);
  }
}
