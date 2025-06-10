<template>
  <div>

    <h1> Your Dashboard </h1>
    <div class="cards">
      <!-- <CCard style="width: 18rem">
              <CCardBody>
                <CCardTitle>Income</CCardTitle>
                <CCardSubtitle class="mb-2 text-body-secondary"
                  >Income Overview</CCardSubtitle
                >
                <CCardText>
                  This Month:{{ formatCurrency(currentMonthExpenses) }}<br/>
                  overall:{{ formatCurrency(totalExpenses) }}
                </CCardText>
              </CCardBody>
      </CCard>

      <CCard style="width: 18rem">
              <CCardBody>
                <CCardTitle>Expense</CCardTitle>
                <CCardSubtitle class="mb-2 text-body-secondary"
                  >Expense Overview</CCardSubtitle
                >
                <CCardText>
                  This Month:{{ formatCurrency(currentMonthExpenses) }}<br/>
                  overall:{{ formatCurrency(totalExpenses) }}
                </CCardText>
              </CCardBody>
      </CCard> -->
      <IncomeCard/>
      <ExpenseCard/>
      <!-- <newCards/> -->
    </div>
    <div class="mt-5">
      <CChartBarExample/>
    </div>
  </div>
</template>

<script setup>
import IncomeCard from './IncomeCard.vue'
import ExpenseCard from './ExpenseCard.vue'
import CChartBarExample from './CChartBarExample.vue'
</script>
<style>
h1{
  text-align: center;
  color: #5E5CD0;
}
.cards{
  display: flex;
  justify-content: space-between;
}
</style>