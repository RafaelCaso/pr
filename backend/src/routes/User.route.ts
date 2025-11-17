import { createUser, createUserPayload } from '@/controllers/User.controller';
import { getUserByStytchId, getUserByStytchIdPayload } from '@/controllers/User.controller';
import { updateUser, updateUserPayload } from '@/controllers/User.controller';
import Elysia from 'elysia';

export const userRoutes = new Elysia()
  // GET endpoint with query parameters
  // Usage: GET /user/get?stytchId=xxx
  .get('/get', getUserByStytchId, getUserByStytchIdPayload)
  
  // POST endpoint with body
  // Usage: POST /user/create with body { stytchId: "xxx", firstName: "John", lastName: "Doe" }
  .post('/create', createUser, createUserPayload)
  
  // PUT endpoint with URL params and body
  // Usage: PUT /user/update/xxx with body { firstName: "Jane", lastName: "Smith" }
  .put('/update/:stytchId', updateUser, updateUserPayload);

