import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type FileDocument = HydratedDocument<File>;

@Schema()
export class File {
  @Prop()
  name: string;

  @Prop()
  user_id: number;

  @Prop()
  key: string;

  @Prop()
  type: string;

  @Prop({ default: now() })
  created_at: Date;

  @Prop({ default: now() })
  updated_at: Date;

  @Prop()
  deleted_at?: Date;

  @Prop()
  is_deleted?: boolean;
}

export const FileSchema = SchemaFactory.createForClass(File);
