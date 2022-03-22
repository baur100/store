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
    host: process.env.HOST,
    basePath: '/api',
    tags: [{
        name: 'Store',
        description: 'Store'
    }],
    schemes: [
        process.env.SCHEME
    ],
    paths: {
        '/product': {
            post: {
                tags: ['product'],
                summary: 'Add new product',
                description: 'Create new Product',
                operationId: 'createProduct',
                consumes: ['application/json'],
                produces: ['application/json', 'application/xml'],
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
            },
            get: {
                tags: ['product'],
                summary: 'Get All Products',
                description: 'Returns all products',
                operationId: 'getAllProducts',
                produces: ['application/json', 'application/xml'],
                parameters: [],
                responses: {
                    200: {
                        description: 'Success - Returns product info',
                        schema: {
                            type: 'array',
                            items: {
                                $ref: '#/definitions/FullProduct'
                            }
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
                produces: ['application/json', 'application/xml'],
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
                produces: ['application/json', 'application/xml'],
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
            },
            put: {
                tags: ['product'],
                summary: 'Update existing product',
                description: 'This call will update all field on product',
                operationId: 'updateProductById',
                consumes: ['application/json'],
                produces: ['application/json', 'application/xml'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        description: 'ID of product to update',
                        required: true,
                        schema: {
                            type: 'integer',
                            format: 'int32'
                        }
                    },
                    {
                        in: 'body',
                        name: 'body',
                        description: 'Product update description',
                        required: true,
                        schema: {
                            $ref: '#/definitions/Product'
                        }
                    }],
                responses: {
                    200: {
                        description: 'Success - Product updated',
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
                    },
                    404 : {
                        description: 'Error',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/Error'
                        }
                    }
                }
            },
            patch: {
                tags: ['product'],
                summary: 'Patch quantity and/or price for existing product',
                description: 'This call will update quantity and/or price on product',
                operationId: 'patchProductById',
                consumes: ['application/x-www-form-urlencoded'],
                produces: ['application/json', 'application/xml'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        description: 'ID of product to update',
                        required: true,
                        schema: {
                            type: 'integer',
                            format: 'int32'
                        }
                    },
                    {
                        name: 'quantity',
                        in: 'formData',
                        description: 'Updated product quantity',
                        required: false,
                        type: 'integer',
                        format: 'int32'
                    },
                    {
                        name: 'price',
                        in: 'formData',
                        description: 'Updated product price',
                        required: false,
                        type: 'number',
                        format: 'double'
                    }],
                responses: {
                    200: {
                        description: 'Success - Product updated',
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
                    },
                    404 : {
                        description: 'Error',
                        schema: {
                            type: 'object',
                            $ref: '#/definitions/Error'
                        }
                    }
                }
            }
        },
        '/product/search': {
            get: {
                tags: ['product'],
                summary: 'Get Products by Product name',
                description: 'Returns products by it name',
                operationId: 'searchByProductName',
                produces: ['application/json', 'application/xml'],
                parameters: [{
                    name: 'name',
                    in: 'query',
                    description: 'Product name',
                    required: true,
                    type: 'string',
                }],
                responses: {
                    200: {
                        description: 'Success - Returns product info',
                        schema: {
                            type: 'array',
                            items: {
                                $ref: '#/definitions/FullProduct'
                            }
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
                    type: 'integer',
                    format:'int32',
                    example: 12
                },
                price: {
                    type: 'number',
                    format: 'double',
                    example: 2.12
                },
            }
        },
        FullProduct: {
            type: 'object',
            properties: {
                id: {
                    type: 'integer',
                    example: 5
                },
                product_name: {
                    type: 'string',
                    example: 'Cane Sugar'
                },
                quantity: {
                    type: 'integer',
                    format:'int32',
                    example: 12
                },
                price: {
                    type: 'number',
                    format: 'double',
                    example: 2.12
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
                            format:'int32',
                            example: 12
                        },
                        price: {
                            type: 'number',
                            format: 'double',
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