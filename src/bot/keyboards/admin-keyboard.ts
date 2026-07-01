import { InlineKeyboard } from 'grammy';
import { STICKERS } from '../../utils/constants';

export function buildAdminKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(`${STICKERS.stats} Statistics`, 'admin:stats')
    .row()
    .text(`${STICKERS.user} List Users`, 'admin:users')
    .row()
    .text(`${STICKERS.broadcast} Broadcast`, 'admin:broadcast')
    .row()
    .text(`${STICKERS.ban} Manage Bans`, 'admin:bans');
}

export function buildUserListKeyboard(users: { telegram_id: number; username: string | null; is_banned: number }[]): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const user of users.slice(0, 20)) {
    const status = user.is_banned ? STICKERS.ban : STICKERS.success;
    const name = user.username ? `@${user.username}` : `ID:${user.telegram_id}`;
    keyboard.text(`${status} ${name}`, `admin:user:${user.telegram_id}`);
    keyboard.row();
  }

  keyboard.text('Back', 'admin:back');
  return keyboard;
}

export function buildBanKeyboard(telegramId: number, isBanned: boolean): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (isBanned) {
    keyboard.text(`${STICKERS.success} Unban User`, `admin:unban:${telegramId}`);
  } else {
    keyboard.text(`${STICKERS.ban} Ban User`, `admin:ban:${telegramId}`);
  }
  keyboard.row();
  keyboard.text('Back', 'admin:users');

  return keyboard;
}
