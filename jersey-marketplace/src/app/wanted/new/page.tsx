import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function NewWantedPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/wanted/new");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-lg">Post a Wanted</h1>
        <p className="text-sm text-muted-foreground">
          Tell the community what you're hunting. Sellers with matching jerseys get notified, and
          you'll get a ping when a listing matches your post.
        </p>
      </header>

      <form action="/api/wanted" method="post" encType="multipart/form-data">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-2">
              <Label htmlFor="title">What are you looking for?</Label>
              <Input id="title" name="title" required placeholder="Rosenborg 1996 home #10 player issue" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="club">Club</Label>
                <Input id="club" name="club" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="season">Season</Label>
                <Input id="season" name="season" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="player">Player (optional)</Label>
                <Input id="player" name="player" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sizePref">Size</Label>
                <Input id="sizePref" name="sizePref" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Details</Label>
              <Input id="description" name="description" placeholder="Condition expectations, variants you'll accept, etc." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxPrice">Max price (NOK)</Label>
              <Input id="maxPrice" name="maxPrice" type="number" min={0} />
            </div>
            <div className="grid gap-2">
              <Label>Reference photos (optional)</Label>
              <input type="file" name="images" multiple accept="image/*" className="text-sm" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <Button type="submit" size="lg">
            Post Wanted
          </Button>
        </div>
      </form>
    </div>
  );
}
