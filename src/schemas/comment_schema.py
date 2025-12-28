from marshmallow import Schema, fields, validate

class CommentCreateSchema(Schema):
    content = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    parent_id = fields.Int(required=False)

class CommentUpdateSchema(Schema):
    content = fields.Str(required=True, validate=validate.Length(min=1, max=500))
