import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({
        success: false,
        error: 'Auth error',
        details: authError.message,
      }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({
        success: false,
        error: 'Profile query error',
        details: profileError.message,
        code: profileError.code,
      }, { status: 500 });
    }

    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id);

    if (workspaceError) {
      return NextResponse.json({
        success: false,
        error: 'Workspace query error',
        details: workspaceError.message,
        code: workspaceError.code,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        profile,
        workspaces,
        workspaceCount: workspaces?.length || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error.message,
    }, { status: 500 });
  }
}
