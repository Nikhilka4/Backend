import mongoose, { Schema, model } from "mongoose";
import mongooseAggregratePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile:{
            type:String, //cloudinary video id
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        title: {
            type: String,
            required: true,
            // unique: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: false
        }
    }, {timestamps: true}
)

videoSchema.plugin(mongooseAggregratePaginate);

export const Video = model("Video", videoSchema); 