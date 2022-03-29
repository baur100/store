import * as chai from 'chai';
const expect = chai.expect;
import router from '../../../src/routes/auth.routes.js';

describe('test auth routes',()=>{
    it('should match route and method', ()=>{
        const routes = [
            { path: '/register', method: 'post' },
            { path: '/login', method: 'post' },
            { path: '/', method: 'get' },
            { path: '/:id', method: 'get' },
            { path: '/:id', method: 'delete' },
            { path: '/:id', method: 'patch' },
        ];

        routes.forEach((route) => {
            const match = router.stack.find(
                (s) => s.route.path === route.path && s.route.methods[route.method]
            );
            expect(match).not.be.undefined;
        });
    });
});

