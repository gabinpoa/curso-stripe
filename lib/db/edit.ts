import { and, eq, lt } from 'drizzle-orm';
import { db } from './drizzle';
import { lessons, modules } from './schema';

async function editDb() {
  const modulesData = await db.select().from(modules);
  for (const module of modulesData) {
    const lessonData = await db
      .update(lessons)
      .set({
        content: `
An h2 header
------------

Here's a numbered list:

 1. first item
 2. second item
 3. third item

Note again how the actual text starts at 4 columns in (4 characters
from the left side). Here's a code sample:

    # Let me re-iterate ...
    for i in 1 .. 10 \{ do-something(i) }

As you probably guessed, indented 4 spaces. By the way, instead of
indenting the block, you can use delimited blocks, if you like:

~~~
define foobar() \{
    print "Welcome to flavor country!";
}
~~~

(which makes copying & pasting easier). You can optionally mark the
delimited block for Pandoc to syntax highlight it:

~~~python
\import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
~~~
        `,
      })
      .where(and(eq(lessons.moduleId, module.id), eq(lessons.order, 3)));
  }
}
editDb()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Edit process finished');
    process.exit(0);
  });
