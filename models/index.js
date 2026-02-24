function RoomResponseObject(data) {
  this.content = data.content || "";
  this.senderId = data.senderId || "";
  this.roomName = data.roomName || "";
  this.username = data.username || "";
  this.replyTo = data.replyTo || null;
  this.files = data.files || [];
  this.createdAt = data.createdAt || null;
}

function PersonalMessageResponseObject(data) {
  this.content = data.content || "";
  this.username = data.username || "";
  this.to = data.to || "";
  this.from = data.from || "";
  this.senderId = data.senderId || "";
  this.replyTo = data.replyTo || {};
  this.files = data.files || [];
  this.createdAt = data.createdAt || null;
  this.conversationId = data.conversationId;
}

function FileObject(file, uploaded) {
  this.originalname = file.originalname;
  this.path = uploaded.url;
  this.publicId = uploaded.publicId;
  this.type = file.mimetype;
  this.local = false;
  this.isSuccess = true;
  this.viewOnce = true;
  this.isFailed = false;
}

module.exports = {
  RoomResponseObject,
  PersonalMessageResponseObject,
  FileObject,
};
