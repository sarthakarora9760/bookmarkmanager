import mongoose from "mongoose";
const bookmarkschema=new mongoose.Schema({
    id:String,
    url:{type:String, required:true},
    title: {type:String, required:true},
    category:{type:String, required:true},
    uid:{type:String, required:true},
    timestamp:Date,
    tags:String
});
export const bookmark=mongoose.model("bookmark",bookmarkschema);