<template>
  <div class="row">
    <div class="col-sm-6 col-lg-3">
      <CWidgetStatsA
        class="mb-4"
        color="primary"
        :value="'26K'"
        title="Users"
        action="View all users"
      >
        <template #icon>
          <CIcon icon="cil-people" height="36"/>
        </template>
      </CWidgetStatsA>
    </div>
    
    <div class="col-sm-6 col-lg-3">
      <CWidgetStatsA
        class="mb-4"
        color="warning"
        :value="'2.49%'"
        title="Conversion Rate"
        action="View conversions"
      >
        <template #icon>
          <CIcon icon="cil-chart-pie" height="36"/>
        </template>
      </CWidgetStatsA>
    </div>
    
    <div class="col-sm-6 col-lg-3">
      <CWidgetStatsA
        class="mb-4"
        color="danger"
        :value="'44K'"
        title="Sessions"
        action="View sessions"
      >
        <template #icon>
          <CIcon icon="cil-speedometer" height="36"/>
        </template>
      </CWidgetStatsA>
    </div>
  </div>
</template>

<script>
import { CWidgetStatsA } from '@coreui/vue'
import { CIcon } from '@coreui/icons-vue'

export default {
  components: {
    CWidgetStatsA,
    CIcon
  }
}
</script>