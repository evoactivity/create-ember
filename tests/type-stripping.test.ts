import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { stripTypes } from '#lib/type-stripping.ts';
import stripIndent from 'strip-indent';

describe('Strips types in plain TypeScript', () => {
  it('should strip TypeScript types from a simple source', async () => {
    const input = stripIndent(`
      const greeting: string = 'Hello, World!';
      function add(a: number, b: number): number {
        return a + b;
      }
    `);

    const output = await stripTypes(input, path.resolve(process.cwd(), 'test-file.ts'));
    expect(output.trim()).toMatchInlineSnapshot(`
      "const greeting = 'Hello, World!';
      function add(a, b) {
        return a + b;
      }"
    `);
  });

  it('should handle source with no types gracefully', async () => {
    const input = stripIndent(`
      const message = 'No types here!';
      function multiply(x, y) {
        return x * y;
      }
    `);

    const output = await stripTypes(input, path.resolve(process.cwd(), 'test-file.ts'));
    expect(output.trim()).toMatchInlineSnapshot(`
      "const message = 'No types here!';
      function multiply(x, y) {
        return x * y;
      }"
    `);
  });

  it('should strip types from complex source code', async () => {
    const input = stripIndent(`
      interface User {
        name: string;
        age: number;
      }

      class Person implements User {
        name;
        age;

        constructor(name: string, age: number) {
          this.name = name;
          this.age = age;
        }

        greet(): string {
          return \`Hello, my name is \${this.name} and I'm \${this.age} years old.\`;
        }
      }
    `);
    const output = await stripTypes(input, path.resolve(process.cwd(), 'test-file.ts'));
    expect(output.trim()).toMatchInlineSnapshot(`
      "class Person {
        name;
        age;

        constructor(name, age) {
          this.name = name;
          this.age = age;
        }

        greet() {
          return \`Hello, my name is \${this.name} and I'm \${this.age} years old.\`;
        }
      }"
    `);
  });
});

describe('Strips types in Ember Template Tag Files', () => {
  it('should handle ember template tags', async () => {
    const input = stripIndent(`
      const something: string = 'hello world';

      <template>
        <div>
          <h1>{{something}}</h1>
        </div>
      </template>
    `);
    const output = await stripTypes(input, path.resolve(process.cwd(), 'test-file.gts'));
    expect(output.trim()).toMatchInlineSnapshot(`
      "const something = 'hello world';

      <template>
        <div>
          <h1>{{something}}</h1>
        </div>
      </template>"
    `);
  });

  it('should handle multiple ember template tags', async () => {
    const input = stripIndent(`
      const count: number = 42;

      <template>
        <div>
          <p>Count is {{count}}</p>
        </div>
      </template>

      function greet(name: string): string {
        return \`Hello, \${name}!\`;
      }

      <template>
        <section>
          <h2>{{greet "User"}}</h2>
        </section>
      </template>
    `);
    const output = await stripTypes(input, path.resolve(process.cwd(), 'test-file.gts'));
    expect(output.trim()).toMatchInlineSnapshot(`
      "const count = 42;

      <template>
        <div>
          <p>Count is {{count}}</p>
        </div>
      </template>

      function greet(name) {
        return \`Hello, \${name}!\`;
      }

      <template>
        <section>
          <h2>{{greet "User"}}</h2>
        </section>
      </template>"
    `);
  });

  it('Strips types in class based components', async () => {
    const input = stripIndent(`
      import Component from '@glimmer/component';

      interface Args {
        title: string;
        count: number;
      }

      export default class MyComponent extends Component<Args> {
        get uppercasedTitle(): string {
          return this.args.title.toUpperCase();
        }

        incrementedCount(): number {
          return this.args.count + 1;
        }
      }

      <template>
        <h1>{{this.uppercasedTitle}}</h1>
        <p>Count: {{this.incrementedCount}}</p>
      </template>
    `);

    const output = await stripTypes(input, path.resolve(process.cwd(), 'my-component.gts'));
    expect(output.trim()).toMatchInlineSnapshot(`
      "import Component from '@glimmer/component';

      export default class MyComponent extends Component {
        get uppercasedTitle() {
          return this.args.title.toUpperCase();
        }

        incrementedCount() {
          return this.args.count + 1;
        }
      }

      <template>
        <h1>{{this.uppercasedTitle}}</h1>
        <p>Count: {{this.incrementedCount}}</p>
      </template>"
    `);
  });
});

describe('Strips types ember template files with multi-byte characters', () => {
  it('should handle emoji in template tags', async () => {
    const input = stripIndent(`
      const message: string = 'Hello, world! 🌍';

      <template>
        <div>
          <h1>{{message}}</h1>
        </div>
      </template>
    `);

    const output = await stripTypes(input, path.resolve(process.cwd(), 'test-file.gts'));
    expect(output.trim()).toMatchInlineSnapshot(`
      "const message = 'Hello, world! 🌍';

      <template>
        <div>
          <h1>{{message}}</h1>
        </div>
      </template>"
    `);
  });

  it('should handle language characters in template tags', async () => {
    const input = stripIndent(`
      const saludo: string = '¡Hola, mundo!';

      <template>
        <div>
          <h1>{{saludo}}</h1>
        </div>
      </template>
    `);

    const output = await stripTypes(input, path.resolve(process.cwd(), 'test-file.gts'));
    expect(output.trim()).toMatchInlineSnapshot(`
      "const saludo = '¡Hola, mundo!';

      <template>
        <div>
          <h1>{{saludo}}</h1>
        </div>
      </template>"
    `);
  });

  it('should handle multi-byte characters in complex templates', async () => {
    const input = stripIndent(`
      interface 用户 {
        名字: string;
        年龄: number;
      }

      const 用户信息: 用户 = {
        名字: '张伟',
        年龄: 30,
      };

      <template>
        <div>
          <h1>用户信息</h1>
          <p>名字: {{用户信息.名字}}</p>
          <p>年龄: {{用户信息.年龄}}</p>
        </div>
      </template>
    `);

    const output = await stripTypes(input, path.resolve(process.cwd(), 'test-file.gts'));
    expect(output.trim()).toMatchInlineSnapshot(`
      "const 用户信息 = {
        名字: '张伟',
        年龄: 30,
      };

      <template>
        <div>
          <h1>用户信息</h1>
          <p>名字: {{用户信息.名字}}</p>
          <p>年龄: {{用户信息.年龄}}</p>
        </div>
      </template>"
    `);
  });
});
