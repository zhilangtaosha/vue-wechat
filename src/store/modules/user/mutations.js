import FriendRequest from '@/util/friendRequest';
import TempRoom from '@/util/tempRoom.js';
import { dateBirth } from '@/util/misc';
import Message from '@/util/message.js';
let message = new Message()
export default {
  initUserInfo(state, info) {
    let age = dateBirth.getAge(info.birthday);
    let constellation = dateBirth.getConstellation(info.birthday);
    state['userInfo'] = Object.assign(info, { id: info._id, age, constellation});
  },
  initEditUserForm(state) {
    let userInfo = state.userInfo;
    state.editForms = Object.assign({
      // avatar: userInfo.avatar,
      signature: userInfo.signature,
      nickname: userInfo.nickname,
      sex: userInfo.sex,
      birthday: userInfo.birthday,
      email: userInfo.email
    })
  },

  setEditUserField(state, info) {
    let {fieldName, value} = info;
    state.editForms[fieldName] = value;
  },
  // 设置在线状态
  setOnline(state, is) {
    state['isOnLine'] = is;
  },




  // --------- 好友/请求部分

  // 初始化好友列表
  initFriendList(state, friendList) {
    friendList = friendList.map((list) => {
      return {
        addAt: list.addAt,
        ...list.friend,
        // 昵称
        remarkname: list.remarkname,
        id: list.friend._id
      }
    })
    state['friendList'] = friendList;
  },
  // 初始化房间列表
  initRoomList(state, rooms) {
    state.roomList = rooms;
  }, 
  // 好友请求列表
  initRequestList(state, List) {
    // 用户
    let {account} = state['userInfo'];
    let fRequest = new FriendRequest();
    let friendRequest = List.reverse().map(req => {
      return fRequest.initRequest({account, req});
    });
    state['friendRequest'] = friendRequest;
  },
  // 添加 好友请求列表
  addRequestList(state, req) {
    let isExit = false;
    // 是否存在
    state['friendRequest'].find((freq) => { return freq.id === req._id && (isExit = true) });
    if (isExit) return;
    let { account } = state['userInfo'];
    let fRequest = new FriendRequest();
    // 新建好友请求
    let newReq = fRequest.initRequest({ account, req });
    state['friendRequest'].unshift(newReq);
  },

  agreeRequest(state, index) {
    let req = state['friendRequest'][index];
    req.acceptStatus = 1;
    state['friendRequest'] = [].concat([], state['friendRequest']);
  },
  rejectRequest(state, index) {
    let req = state['friendRequest'][index];
    req.acceptStatus = 2;
    state['friendRequest'] = [].concat([], state['friendRequest']);
  },

  addUnReadrequest(state) {
    state.unReadRequest++;
  },
  removeUnReadrequest(state) {
    state.unReadRequest = 0;
  },
  initUnReadrequest(state) {
    let userInfo = state.userInfo;
    // 上一次下线时间
    let lastOnlineTime = userInfo.lastOnlineTime;
    let friendRequest = state.friendRequest;
    friendRequest.map(item => {
      let createdAt = item.createdAt;
      let createdAtTime = Number(new Date(createdAt));
      if (createdAtTime >= lastOnlineTime) {
        state.unReadRequest++;
      }
    })
  },
  










  // -------- 关于聊天
  // 创建房间
  newTempRoom(state, room) {
    state.tempRoomList.unshift(room);
    // 房间类型
  },

  // 创建房间
  createRoom(state, room) {
    state.tempRoomList.unshift(room);
  },

  activeRoom(state, index) {
    let room = state.tempRoomList[index];
    room.isActive = true;
    state.tempRoomList = [].concat([], state.tempRoomList);
  },

  // 改变房间
  changeRoom(state, index) {
    state.currRoomIndex = index;
  },


  
  // 添加未读
  addUnRead(state, index) {
    let room = state.tempRoomList[index];
    // 如果来新消息，记录下最老的那条未读消息的时间
    if(room.unread === 0) {
      room.lastUnReadMessage = Date.now();
    }
    room.unread++;
    state.tempRoomList = [].concat([], state.tempRoomList);
  },

  // 读取消息
  readRoomMessage(state, index) {
    let room = state.tempRoomList[index];
    room.unread = 0;
    room.chatRecords.map((chat) => {
      chat.status = 1;
    })
    state.tempRoomList = [].concat([], state.tempRoomList);
  },

  // 添加聊天记录
  addChatRecords(state, { index, chatRecord }) {
    let room = state.tempRoomList[index];
    chatRecord = message.mergeMessage(chatRecord, room, state.userInfo);
    room.chatRecords.push(chatRecord);
  },

  // 设置聊天记录
  setChatRecords(state, { index, chatRecords }) {
    
    let room = state.tempRoomList[index];
    chatRecords = chatRecords.map((msg ) => {
      return message.mergeMessage(msg, room, state.userInfo)   
    })
    room.chatRecords = chatRecords;
  },
  unshiftChatRecords(state, { index, chatRecords} ) {
    let room = state.tempRoomList[index];
    chatRecords = chatRecords.map((msg) => {
      return message.mergeMessage(msg, room, state.userInfo)
    })
    room.chatRecords = [].concat(chatRecords, room.chatRecords);
  },

  // 覆盖消息记录
  coversChatRecord(state, { info, temp_id }) {
    let currRoomIndex = state.currRoomIndex;
    let room = state.tempRoomList[currRoomIndex];
    // 当前房间聊天记录
    let chatRecords = room.chatRecords;
    // 查找符合的聊天记录
    let idx = message.getMessageIndex(chatRecords, temp_id);
    info.isLoad = false;
    info.creater = chatRecords[idx].creater;
    // 合并覆盖这条记录
    chatRecords[idx] = Object.assign(chatRecords[idx] ,info);
    state.tempRoomList = [].concat([], state.tempRoomList)
  }
  
}
