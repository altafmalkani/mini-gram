from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True, validate=[validate.Email(error='It must be a valid email')])
    password = fields.Str(required=True, validate=validate.Length(min=6))
    bio = fields.Str(required=False)
    profile_image = fields.Str(required=False)
    created_at = fields.DateTime(required=False)

class LoginSchema(Schema):
    identifier = fields.Str(required=True, error_messages={"required": "username or password required"})
    password = fields.Str(required=True)

