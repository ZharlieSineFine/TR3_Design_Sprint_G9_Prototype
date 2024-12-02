<template>
  <v-container>
    <v-row>
      <!-- Search and Filter -->
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="Search Products"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="sortBy"
                  :items="sortOptions"
                  label="Sort By"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="12" md="4" class="d-flex justify-end">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-filter"
                  @click="showFilterDialog = true"
                >
                  Filter
                </v-btn>
                <v-btn
                  v-if="userStore.user"
                  color="primary"
                  class="ml-2"
                  prepend-icon="mdi-plus"
                  @click="showItemDialog = true"
                >
                  Post Item
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Product List -->
      <v-col
        v-for="item in items"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="h-100"
          @click="handleItemClick(item)"
        >
          <v-img
            :src="item.images[0]"
            height="200"
            cover
          />
          <v-card-title class="text-truncate">
            {{ item.title }}
          </v-card-title>
          <v-card-subtitle>
            <div class="d-flex align-center">
              <span class="text-primary">￥{{ item.price }}</span>
              <v-spacer />
              <v-chip
                size="small"
                :color="item.status === 'available' ? 'success' : 'error'"
              >
                {{ item.status === 'available' ? 'Available' : 'Sold' }}
              </v-chip>
            </div>
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <!-- Load More -->
    <div v-if="hasMore" class="text-center py-4">
      <v-btn
        variant="text"
        :loading="loading"
        @click="loadMore"
      >
        Load More
      </v-btn>
    </div>

    <!-- Product Edit Dialog -->
    <item-edit-dialog
      v-model="showItemDialog"
      :item="selectedItem"
      @saved="handleItemSaved"
    />

    <!-- Filter Dialog -->
    <v-dialog v-model="showFilterDialog" max-width="500">
      <v-card>
        <v-card-title>Filter Options</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="filters.category"
                :items="categories"
                label="Category"
                clearable
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="filters.condition"
                :items="conditionOptions"
                label="Condition"
                clearable
              />
            </v-col>
            <v-col cols="12">
              <v-range-slider
                v-model="filters.priceRange"
                :min="0"
                :max="10000"
                :step="100"
                label="Price Range"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="resetFilters">Reset</v-btn>
          <v-btn
            color="primary"
            @click="applyFilters"
          >
            Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessage } from '@/utils/message'
import { marketplaceApi } from '@/api'
import ItemEditDialog from '@/components/marketplace/ItemEditDialog.vue'

const userStore = useUserStore()
const { showMessage, showError } = useMessage()

// State
const items = ref([])
const loading = ref(false)
const hasMore = ref(false)
const page = ref(1)
const searchQuery = ref('')
const sortBy = ref('latest')
const showFilterDialog = ref(false)
const showItemDialog = ref(false)
const selectedItem = ref(null)

// Filter Conditions
const filters = ref({
  category: null,
  condition: null,
  priceRange: [0, 10000]
})

// Options
const sortOptions = [
  { title: 'Latest', value: 'latest' },
  { title: 'Price Low to High', value: 'price_asc' },
  { title: 'Price High to Low', value: 'price_desc' }
]

const categories = [
  { title: 'Digital Products', value: 'digital' },
  { title: 'Books & Textbooks', value: 'books' },
  { title: 'Daily Necessities', value: 'life' },
  { title: 'Clothing & Accessories', value: 'clothing' },
  { title: 'Others', value: 'other' }
]

const conditionOptions = [
  { title: 'New', value: 'new' },
  { title: '90% New', value: '90' },
  { title: '80% New', value: '80' },
  { title: '70% New', value: '70' },
  { title: '60% New or Below', value: '60' }
]

// Load Product List
const loadItems = async (isLoadMore = false) => {
  try {
    loading.value = true
    const params = {
      page: isLoadMore ? page.value + 1 : 1,
      search: searchQuery.value,
      sortBy: sortBy.value,
      ...filters.value
    }

    const { data, meta } = await marketplaceApi.getItems(params)
    
    if (isLoadMore) {
      items.value.push(...data)
      page.value++
    } else {
      items.value = data
      page.value = 1
    }

    hasMore.value = page.value < meta.lastPage
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// Load More
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loadItems(true)
}

// Reset Filters
const resetFilters = () => {
  filters.value = {
    category: null,
    condition: null,
    priceRange: [0, 10000]
  }
}

// Apply Filters
const applyFilters = () => {
  showFilterDialog.value = false
  loadItems()
}

// Handle Product Click
const handleItemClick = (item) => {
  selectedItem.value = item
  showItemDialog.value = true
}

// Handle Product Saved
const handleItemSaved = () => {
  loadItems()
}

// Watch Search and Filter Changes
watch(
  [searchQuery, sortBy, filters],
  () => {
    loadItems()
  },
  { deep: true }
)

// Initialize
onMounted(() => {
  loadItems()
})
</script> 