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
    host: 'localhost:3000',
    basePath: '/api',
    tags: [{
        name: 'Store',
        description: 'Store'
    }],
    schemes: [
        'http'
    ],
    paths: {
        '/product': {
            post: {
                tags: ['product'],
                summary: 'Adding new product',
                description: '',
                operationId: 'createProduct',
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [{
                    in: 'body',
                    name: 'body',
                    description: 'Product description',
                    required: true,
                    schema: {
                        $ref: '#/definitions/Product'
                    }
                }],
                responses: {
                    201: {
                        description: 'Success - Product added',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/ProductResponse'
                        }
                    },
                    400: {
                        description: 'Error',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/Error'
                        }
                    }
                }
            }
        },
        '/product/{id}': {
            get: {
                tags: ['product'],
                summary: 'Get product by id',
                description: 'Returns product information by product id',
                operationId: 'getProductById',
                produces: ['application/json'],
                parameters: [{
                    name: 'id',
                    in: 'path',
                    description: 'ID of product to return',
                    required: true,
                    schema: {
                        type: 'integer',
                        format: 'int32'
                    }
                }],
                responses: {
                    200: {
                        description: 'Success - Returns product info',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/FullProduct'
                        }
                    },
                    400: {
                        description: 'Error',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/Error'
                        }
                    }
                }
            },
            delete: {
                tags: ['product'],
                summary: 'Delete product by id',
                description: 'Returns product information by product id',
                operationId: 'deleteProductById',
                produces: ['application/json'],
                parameters: [{
                    name: 'id',
                    in: 'path',
                    description: 'ID of product to delete',
                    required: true,
                    schema: {
                        type: 'integer',
                        format: 'int32'
                    }
                }],
                responses: {
                    200: {
                        description: 'Positive response',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/Message'
                        }
                    },
                    400: {
                        description: 'Error',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/Error'
                        }
                    },
                    404: {
                        description: 'Product not found',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/Error'
                        }
                    }
                }
            }
        }
    },
    definitions: {
        Product: {
            type: 'object',
            required: ['product_name', 'quantity', 'price'],
            properties: {
                product_name: {
                    type: 'string',
                    example: 'Cane Sugar'
                },
                quantity: {
                    type: 'string',
                    example: '12'
                },
                price: {
                    type: 'string',
                    example: '2.12'
                },
            }
        },
        FullProduct: {
            type: 'object',
            properties: {
                product_name: {
                    type: 'string',
                    example: 'Cane Sugar'
                },
                quantity: {
                    type: 'string',
                    example: '12'
                },
                price: {
                    type: 'string',
                    example: '2.12'
                },
            }
        },
        ProductResponse: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Product added successfully!'
                },
                product:{
                    type: 'object',
                    properties:{
                        id: {
                            type: 'integer',
                            format: 'int32',
                            example: 142
                        },
                        product_name: {
                            type: 'string',
                            example: 'Cane Sugar'
                        },
                        quantity: {
                            type: 'integer',
                            format: 'int32',
                        },
                        price: {
                            type: 'double',
                            example: 2.12
                        },
                    }
                }
            }
        },
        Error:{
            type: 'object',
            properties: {
                error: {
                    type: 'string',
                    example: 'error description'
                }
            }
        },
        Message: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Response message'
                }
            }
        }

    }
};