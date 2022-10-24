import { AuthenticationError } from "apollo-server";
import { Context } from "..";
import { CreateProductInput } from "../../graphql/graphql";

export async function createProduct(createProductDTO: CreateProductInput, user: Context['user'], prisma: Context['prisma']) {
    if(!user) throw new AuthenticationError('no user in the context')
    if(user.role !== 'ADMIN') throw new AuthenticationError('no access to operations')
    return await prisma.product.create({
        data: createProductDTO
    })
}

export async function updateProduct(productId: number, updateProductDTO: Partial<CreateProductInput>, user: Context['user'], prisma: Context['prisma']) {
    if(!user) throw new AuthenticationError('no user in the context')
    if(user.role !== 'ADMIN') throw new AuthenticationError('no access to operations')
    return await prisma.product.update({
        where: {
            id: productId
        },
        data: updateProductDTO
    })
}