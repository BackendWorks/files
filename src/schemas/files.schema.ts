import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FilesDocument = Files & Document;

@Schema()
export class Files {
  @Prop({ type: 'String', required: true })
  file_name: string;

  @Prop({ type: 'String', required: true })
  link: string;

  @Prop({ type: 'Number', required: true })
  user_id: number;

  @Prop({ required: true })
  created_at: Date;

  @Prop()
  updated_at?: Date;

  @Prop()
  deleted_at?: Date;

  @Prop()
  is_deleted?: boolean;
}

export const FilesSchema = SchemaFactory.createForClass(Files);
