-- Add cascade delete to foreign keys
ALTER TABLE "Cart" 
DROP CONSTRAINT IF EXISTS "Cart_userId_fkey",
ADD CONSTRAINT "Cart_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "CartItem"
DROP CONSTRAINT IF EXISTS "CartItem_cartId_fkey",
ADD CONSTRAINT "CartItem_cartId_fkey" 
FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE;

ALTER TABLE "OrderItem"
DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey",
ADD CONSTRAINT "OrderItem_orderId_fkey" 
FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE;

ALTER TABLE "Orders"
DROP CONSTRAINT IF EXISTS "Orders_userId_fkey",
ADD CONSTRAINT "Orders_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;