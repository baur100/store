export default {
    swagger: '2.0',
    info: {
        description: 'API Testing School',
        version: '1.0.0',
        contact: {
            email: 'baurzhan.zh@gmail.com'
        },
        title: 'API Testing School'
    },
    host: 'localhost:6060',
    basePath: '/dev',
    tags: [{
        name: 'auth',
        description: 'Authorization path'
    }],
    schemes: [
        'http'
    ],
    paths: {
        '/auth_server/generate_token': {
            post: {
                tags: ['auth'],
                summary: 'Generates token for existing users, checking credentials',
                description: '',
                operationId: 'GenerateToken',
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [{
                    in: 'body',
                    name: 'body',
                    description: 'User Credentials',
                    required: true,
                    schema: {
                        $ref: '#/definitions/Credentials'
                    }
                }],
                responses: {
                    200: {
                        description: 'Success',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/Token'
                        }
                    },
                    401: {
                        description: 'Wrong Credentials'
                    }
                }
            }
        }
    },
    'definitions': {
        'Credentials': {
            'type': 'object',
            'required': ['username', 'password'],
            'properties': {
                'username': {
                    'type': 'string',
                    'example': 'user1'
                },
                'password': {
                    'type': 'string',
                    'example': 'password123'
                }
            }
        },
        'Token': {
            'type': 'object',
            'properties': {
                'token': {
                    'type': 'string',
                    'example': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NDY3NjMwNTgsInN1YiI6MSwiZXhwIjoxNjQ2NzY2NjU4LCJpc3MiOiJwb3N0bWFuLXNjaG9vbCJ9.Oe-gITSwVMw6UsBib1OZuRBxlAaTokyGaogckxpAyxnOsFak2C_02JVwUkrIzY83AMC7-Mcmfc7ZcvQJscx6DA'
                }
            }
        }

    }
};