import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a
  .schema({
    CourseSubscription: a
      .model({
        subscriptionId: a.string().required(),
        priceUnitAmount: a.integer().required(),
        priceId: a.string().required(),
        productName: a.string().required(),
        productDescription: a.string(),
        productInstructor: a.string(),
        productId: a.string().required(),
        course: a.belongsTo('Course', 'productId'),
        image: a.string(),
        customerId: a.string().required(),
        status: a.enum([
          'active',
          'unpaid',
          'canceled',
          'incomplete',
          'incomplete_expired',
          'past_due',
          'paused',
          'trialing',
        ]),
      })
      .identifier(['subscriptionId'])
      .secondaryIndexes((index) => [
        index('customerId').sortKeys(['productId']),
        index('customerId').sortKeys(['status']),
      ])
      .authorization((allow) => [
        allow.owner().to(['read', 'update', 'create']),
      ]),

    Course: a
      .model({
        productId: a.string().required(),
        subscriptions: a.hasMany('CourseSubscription', 'productId'),
        name: a.string().required(),
        description: a.string(),
        instructor: a.string(),
        image: a.string(),
        priceId: a.string().required(),
        priceUnitAmount: a.integer().required(),
        modules: a.hasMany('Module', 'courseId'),
      })
      .identifier(['productId']),

    Module: a
      .model({
        courseId: a.string().required(),
        course: a.belongsTo('Course', 'courseId'),
        name: a.string().required(),
        description: a.string(),
        order: a.integer().required(),
        isExtraContent: a.boolean().default(false),
        lessons: a.hasMany('Lesson', 'moduleId'),
      })
      .secondaryIndexes((index) => [index('courseId')]),

    Lesson: a
      .model({
        moduleId: a.id().required(),
        module: a.belongsTo('Module', 'moduleId'),
        name: a.string().required(),
        description: a.string(),
        order: a.integer().required(),
        content: a.hasOne('LessonContent', 'lessonId'),
      })
      .secondaryIndexes((index) => [index('moduleId')]),

    LessonContent: a.model({
      lessonId: a.id().required(),
      lesson: a.belongsTo('Lesson', 'lessonId'),
      contentType: a.enum(['MDX', 'VIDEO']),
      content: a.string().required(),
    }),
  })
  .authorization((allow) => [allow.publicApiKey()]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
  },
});
