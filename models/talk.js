var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;
var BaseModel = require("./base_model");



  //要存入数据库的文档
var TalkSchema = new mongoose.Schema({
    create_time: Date,
    author:String,
    author_id:ObjectId,
    tags : [],
    images: String,
    content: String,
    content_is_html: false,
    replys: [{}],
    reprint_info:{
        recomment:String,
        reprint_from:{},
        reprint_to:[]
    },
    likes:[],
    pv:{type: Number, default:0}
});
TalkSchema.plugin(BaseModel);
TalkSchema.index({create_time:-1});
TalkSchema.index({author_id: 1, create_time: -1});

mongoose.model('Talk', TalkSchema);

