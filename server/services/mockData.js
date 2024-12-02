const bcrypt = require('bcrypt')

// 创建一个初始的加密密码
const hashedPassword = bcrypt.hashSync('123456', 10)

// 模拟用户数据
const users = new Map([
  [1, {
    id: 1,
    name: 'admin',
    email: 'admin@example.com',
    password: hashedPassword, // 使用加密后的密码
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    bio: 'System Administrator',
    status: 'active',
    lastLoginAt: new Date()
  }],
  [2, {
    id: 2,
    name: 'Bookworm',
    email: 'reader@example.com',
    password: hashedPassword,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=reader',
    bio: 'A student who loves reading',
    status: 'active',
    lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }],
  [3, {
    id: 3,
    name: 'Sports Enthusiast',
    email: 'sports@example.com',
    password: hashedPassword,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sports',
    bio: 'Love sports, love life',
    status: 'active',
    lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }],
  [4, {
    id: 4,
    name: 'Photography Enthusiast',
    email: 'photo@example.com',
    password: hashedPassword,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photographer',
    bio: 'Capturing beautiful moments through the lens',
    status: 'active',
    lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }]
]);

// 模拟聊天数据
const chats = new Map([
  [1, {
    id: 1,
    userId: 1,
    targetId: 2,
    lastMessageId: 4,
    unreadCount: 0,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }],
  [2, {
    id: 2,
    userId: 1,
    targetId: 3,
    lastMessageId: 6,
    unreadCount: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }]
]);

// 模拟消息数据
const messages = new Map([
  [1, {
    id: 1,
    chatId: 1,
    fromId: 2,
    type: 'text',
    content: 'Hello, I am interested in the iPhone you posted, can you introduce it in detail?',
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  }],
  [2, {
    id: 2,
    chatId: 1,
    fromId: 1,
    type: 'text',
    content: 'This iPhone was bought last year, it has always had a screen protector and a case, and its appearance is close to new.', 
    createdAt: new Date(Date.now() - 25 * 60 * 1000)
  }],
  [3, {
    id: 3,
    chatId: 1,
    fromId: 2,
    type: 'text',
    content: 'What is the battery health? Do you have an invoice?',
    createdAt: new Date(Date.now() - 20 * 60 * 1000)
  }],
  [4, {
    id: 4,
    chatId: 1,
    fromId: 1,
    type: 'text',
    content: 'Battery health is 92%, invoice and packaging box are all available, can verify the machine in person',
    createdAt: new Date(Date.now() - 15 * 60 * 1000)
  }],
  [5, {
    id: 5,
    chatId: 2,
    fromId: 3,
    type: 'text',
    content: 'I heard you also like running, do you want to participate in the campus marathon next week?',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }],
  [6, {
    id: 6,
    chatId: 2,
    fromId: 3,
    type: 'image',
    content: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  }]
]);

// 用户相关操作
const userService = {
  findByEmail(email) {
    console.log('Finding user by email:', email)
    const user = Array.from(users.values()).find(user => user.email === email)
    console.log('Found user:', user ? 'yes' : 'no')
    return user
  },

  findById(id) {
    console.log('Finding user by id:', id)
    const user = users.get(parseInt(id))
    console.log('Found user:', user ? 'yes' : 'no')
    return user
  },

  create(userData) {
    const id = users.size + 1;
    const user = { id, ...userData };
    users.set(id, user);
    return user;
  },

  update(id, data) {
    const user = users.get(id);
    if (user) {
      Object.assign(user, data);
      users.set(id, user);
    }
    return user;
  },

  findAll(query = {}) {
    let result = Array.from(users.values());
    if (query.search) {
      const search = query.search.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }
    return result;
  }
};

// 聊天相关操作
const chatService = {
  findByUsers(userId, targetId) {
    return Array.from(chats.values()).find(chat => 
      (chat.userId === userId && chat.targetId === targetId) ||
      (chat.userId === targetId && chat.targetId === userId)
    );
  },

  create(chatData) {
    const id = chats.size + 1;
    const chat = { 
      id, 
      ...chatData,
      lastMessageId: null,
      unreadCount: 0,
      createdAt: new Date()
    };
    chats.set(id, chat);
    return chat;
  },

  findAllByUser(userId) {
    const userChats = Array.from(chats.values())
      .filter(chat => chat.userId === userId || chat.targetId === userId)
      .map(chat => {
        // 加载最后一条消息
        const lastMessage = chat.lastMessageId ? messages.get(chat.lastMessageId) : null;
        // 加载目标用户信息
        const targetId = chat.userId === userId ? chat.targetId : chat.userId;
        const target = users.get(targetId);
        const { password: _, ...targetData } = target;
        
        return {
          ...chat,
          lastMessage,
          target: targetData
        };
      });

    // 按最后消息时间排序
    return userChats.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || a.createdAt;
      const timeB = b.lastMessage?.createdAt || b.createdAt;
      return new Date(timeB) - new Date(timeA);
    });
  },

  update(id, data) {
    const chat = chats.get(id);
    if (chat) {
      Object.assign(chat, data);
      chats.set(id, chat);
    }
    return chat;
  },

  findById(id) {
    return chats.get(id);
  }
};

// 消息相关操作
const messageService = {
  create(messageData) {
    const id = messages.size + 1;
    const message = { 
      id, 
      ...messageData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    messages.set(id, message);
    return message;
  },

  findByChatId(chatId, query = {}) {
    console.log('Finding messages for chat:', chatId)
    
    let result = Array.from(messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => b.createdAt - a.createdAt)

    const page = parseInt(query.page) || 1
    const pageSize = parseInt(query.pageSize) || 20
    const total = result.length
    
    result = result.slice((page - 1) * pageSize, page * pageSize)

    console.log('Found messages:', result.length)

    return {
      rows: result,
      total,
      currentPage: page,
      lastPage: Math.ceil(total / pageSize)
    }
  },

  update(id, data) {
    const message = messages.get(id);
    if (message) {
      Object.assign(message, data);
      message.updatedAt = new Date();
      messages.set(id, message);
    }
    return message;
  }
};

module.exports = {
  userService,
  chatService,
  messageService
}; 