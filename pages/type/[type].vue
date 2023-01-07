<script setup lang="ts">
const route = useRoute();
</script>
<template>
  <div>
    <!--    <div class="mt-8 flex justify-center">-->
    <!--      <div class="inline-flex flex-col gap-3">-->
    <!--        <SwitchGroup as="div" class="flex items-center">-->
    <!--          <Switch-->
    <!--            v-model="onlyShowActiveOffers"-->
    <!--            :class="[-->
    <!--              onlyShowActiveOffers ? 'bg-emerald-600' : 'bg-gray-200',-->
    <!--              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',-->
    <!--            ]"-->
    <!--          >-->
    <!--            <span-->
    <!--              aria-hidden="true"-->
    <!--              :class="[-->
    <!--                onlyShowActiveOffers ? 'translate-x-5' : 'translate-x-0',-->
    <!--                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',-->
    <!--              ]"-->
    <!--            />-->
    <!--          </Switch>-->
    <!--          <SwitchLabel as="span" class="ml-3">-->
    <!--            <span class="text-sm font-medium text-gray-900">Only show active offers</span>-->
    <!--          </SwitchLabel>-->
    <!--        </SwitchGroup>-->
    <!--      </div>-->
    <!--    </div>-->
    <div class="grid gap-8">
      <OfferView :filter="{ '#t': [route.params.type] }" />
    </div>
  </div>
</template>
