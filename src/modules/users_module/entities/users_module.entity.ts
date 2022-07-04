import { Date, Document, Schema as Mongoose_schema } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type Users_vo = Users & Document;

/*const Profile_pic_schema = new Mongoose_schema({
  location: { type: String, required: true },
  key: { type: String, required: true },
});*/

@Schema()
export class Users {
  @Prop({ type: String, required: true })
  auth0_id;
  @Prop({ type: String, required: true })
  email;
  @Prop({ type: String, default: 'traveler' }) //traveler | host
  role;
  @Prop({ type: Boolean, default: false })
  notifications;
  @Prop(
    raw({
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      profile_pic: { type: String, required: true },
      date_of_birth: { type: String, required: true },
      gender: { type: String, default: null }, //male | female | other
    }),
  )
  profile;
  @Prop({ type: Date, default: Date.now })
  created_at;
  @Prop({ type: Date, default: Date.now })
  updated_at;
  @Prop({ type: Date, default: null })
  deleted_at;
}

export const users_schema = SchemaFactory.createForClass(Users);
/**
   @Prop(
    raw({
      country_code: { type: String, required: true },
      number: { type: Number, required: true },
    }),
  )
  phone_number;

  */
