import { Context } from 'grammy';
import { handleQualitySelect } from './quality-select';
import { showComments, closeComments } from './comments-view';
import { handleAdminCallback } from './admin-handler';
import { handleTypeSelect, handleBackToMain } from './type-select';

export async function handleCallbacks(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  if (data.startsWith('quality:')) {
    return handleQualitySelect(ctx);
  }

  if (data.startsWith('type:')) {
    return handleTypeSelect(ctx);
  }

  if (data.startsWith('back:')) {
    return handleBackToMain(ctx);
  }

  if (data.startsWith('comments:')) {
    return showComments(ctx);
  }

  if (data.startsWith('close_comments:')) {
    return closeComments(ctx);
  }

  if (data.startsWith('admin:')) {
    return handleAdminCallback(ctx);
  }
}
