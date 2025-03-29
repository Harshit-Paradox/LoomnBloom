import {Address} from "../models/Address.js"
import { Variant } from "../models/Product.js";


export interface NewUserRequestBody{
    name:string,
    email:string,
    password:string
}

export interface NewProductRequestBody {
  productName: string;          
  price: number;                 
  category: string;              
  subCategory?: string;           
  description?: string;          
  variants: string;       
  status: 'active' | 'deactive' | 'draft';
}

// export interface NewOrderResponseBody{
//     cartId, paymentId, status, shippingAddress 
// }



// export interface NewUserResponseBody{
//     name:string,
//     email:string,
//     profilePhoto:string,
//     address:Address[]
// }