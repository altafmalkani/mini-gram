from marshmallow import Schema, fields, validate

class PostCreateSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    caption = fields.Str(required=False)
    image_url = fields.Str(required=False)

class PostUpdateSchema(Schema):
    title = fields.Str(required=False, validate=validate.Length(min=1, max=150))
    caption = fields.Str(required=False)
