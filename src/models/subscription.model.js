import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        channel: { // also a kind of user to whom subscriber will subscribe
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        subscriber: { // one who is subscribing
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }, {timestamps: true});



export const Subscription = mongoose.model("Subscription", subscriptionSchema) 