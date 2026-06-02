import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, AlertCircle, UserPlus, TrendingUp, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STYLES = `
  .notif-panel-trigger {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F8F5F2;
    border: 1px solid #EFE7DE;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: #8B7355;
  }
  .notif-panel-trigger:hover {
    background: #EFE7DE;
    color: #2D2D2D;
  }
  .notif-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #dc2626;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(220,38,38,0.3);
  }
  
  .notif-overlay {
    position: fixed;
    inset: 0;
    z-index: 998;
  }
  
  .notif-dropdown {
    position: absolute;
    top: 48px;
    right: 0;
    width: 380px;
    max-height: 520px;
    background: #FFFFFF;
    border: 1px solid #EFE7DE;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(45,45,45,0.12);
    z-index: 999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .notif-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #EFE7DE;
    background: #FDFCFB;
  }
  .notif-title {
    font-size: 14px;
    font-weight: 700;
    color: #2D2D2D;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .notif-mark-all {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: #F8F5F2;
    border: 1px solid #EFE7DE;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #8B7355;
    cursor: pointer;
    transition: all 0.2s;
  }
  .notif-mark-all:hover {
    background: #2D2D2D;
    color: #C6A969;
    border-color: #2D2D2D;
  }
  
  .notif-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  
  .notif-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    margin-bottom: 6px;
    cursor: pointer;
    transition: background 0.15s;
    border: 1px solid transparent;
  }
  .notif-item:hover {
    background: #F8F5F2;
    border-color: #EFE7DE;
  }
  .notif-item.unread {
    background: #FEF9F5;
    border-color: #F5E6D3;
  }
  
  .notif-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .notif-icon-new { background: #DBEAFE; color: #2563eb; }
  .notif-icon-approved { background: #DCFCE7; color: #16a34a; }
  .notif-icon-low-stock { background: #FEF9C3; color: #ca8a04; }
  .notif-icon-high-sale { background: #F3E8FF; color: #9333ea; }
  
  .notif-content {
    flex: 1;
    min-width: 0;
  }
  .notif-item-title {
    font-size: 13px;
    font-weight: 600;
    color: #2D2D2D;
    margin-bottom: 3px;
    line-height: 1.3;
  }
  .notif-item-msg {
    font-size: 12px;
    color: #8B7355;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .notif-item-time {
    font-size: 10px;
    color: #D6D3D1;
    margin-top: 4px;
  }
  
  .notif-close-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F8F5F2;
    border: 1px solid #EFE7DE;
    border-radius: 6px;
    cursor: pointer;
    color: #8B7355;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .notif-close-btn:hover {
    background: #dc2626;
    color: white;
    border-color: #dc2626;
  }
  
  .notif-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    color: #D6D3D1;
  }
  .notif-empty-icon {
    margin-bottom: 12px;
  }
  .notif-empty-text {
    font-size: 13px;
    color: #8B7355;
  }
`;

const ICON_MAP = {
  NEW_USER_REGISTRATION: { Icon: UserPlus, class: 'notif-icon-new' },
  PROFILE_APPROVED: { Icon: Check, class: 'notif-icon-approved' },
  LOW_STOCK_ALERT: { Icon: Package, class: 'notif-icon-low-stock' },
  HIGH_VALUE_SALES: { Icon: TrendingUp, class: 'notif-icon-high-sale' },
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function NotificationPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/my-alerts');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      console.log('🔔 Fetching unread count...');
      const res = await api.get('/api/notifications/unread-count');
      console.log('✅ Unread count:', res.data);
      setUnreadCount(res.data || 0);
    } catch (err) {
      console.error('❌ Failed to fetch unread count:', err.response?.status, err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user?.token]);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.put(`/api/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      
      <div style={{ position: 'relative' }}>
        <button className="notif-panel-trigger" onClick={handleOpen}>
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {open && (
          <>
            <div className="notif-overlay" onClick={() => setOpen(false)} />
            <div className="notif-dropdown">
              <div className="notif-header">
                <div className="notif-title">
                  <Bell size={16} />
                  Notifications
                </div>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={handleMarkAllAsRead}>
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {loading ? (
                  <div className="notif-empty">
                    <div className="notif-empty-icon">⏳</div>
                    <div className="notif-empty-text">Loading notifications...</div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="notif-empty">
                    <div className="notif-empty-icon">
                      <Bell size={48} color="#D6D3D1" />
                    </div>
                    <div className="notif-empty-text">No notifications yet</div>
                  </div>
                ) : (
                  notifications.map(notif => {
                    const { Icon, class: iconClass } = ICON_MAP[notif.type] || { Icon: AlertCircle, class: 'notif-icon-new' };
                    return (
                      <div
                        key={notif.id}
                        className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                        onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                      >
                        <div className={`notif-icon-wrap ${iconClass}`}>
                          <Icon size={18} />
                        </div>
                        <div className="notif-content">
                          <div className="notif-item-title">{notif.title}</div>
                          <div className="notif-item-msg">{notif.message}</div>
                          <div className="notif-item-time">{timeAgo(notif.createdAt)}</div>
                        </div>
                        {!notif.isRead && (
                          <div style={{ width: 8, height: 8, background: '#2563eb', borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
