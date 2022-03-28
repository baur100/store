import * as chai from 'chai';
const expect = chai.expect;
import router from '../../../src/routes/product.routes.js';

describe('test product routes',()=>{
    it('should match route and method', ()=>{
        const routes = [
            { path: '/', method: 'post' },
            { path: '/search', method: 'get' },
            { path: '/', method: 'get' },
            { path: '/:id', method: 'get' },
            { path: '/:id', method: 'delete' },
            { path: '/:id', method: 'patch' },
            { path: '/:id', method: 'patch' },
        ]

        routes.forEach((route) => {
            const match = router.stack.find(
                (s) => s.route.path === route.path && s.route.methods[route.method]
            );
            expect(match).not.be.undefined;
        });
    })
});

