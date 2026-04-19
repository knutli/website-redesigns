-- Promote a user to admin.
-- Replace 'you@oase.ai' with the email you signed up with.
UPDATE "user" SET role = 'admin' WHERE email = 'you@oase.ai';
