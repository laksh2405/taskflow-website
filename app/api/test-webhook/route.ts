import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!webhookUrl || !webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook configuration missing' },
        { status: 500 }
      );
    }

    const testPayload = {
      event: 'task.assigned',
      timestamp: new Date().toISOString(),
      data: {
        taskId: 'test-task-123',
        taskTitle: 'Test Task',
        assignedTo: 'test-user@example.com',
        assignedBy: 'admin@example.com',
        projectName: 'Test Project',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      secret: webhookSecret,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const responseData = await response.text();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      webhookUrl,
      response: responseData,
      payload: testPayload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to trigger webhook',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
